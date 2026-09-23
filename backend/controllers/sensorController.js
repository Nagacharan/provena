const db = require('../database/db');
const { canonicalizeSensorData, generateSHA256Hash } = require('../utils/cryptoUtils');
const simulator = require('../simulator/sensorSimulator');
const blockchainService = require('../blockchain/blockchainService');

/**
 * Controller handling sensor simulation, off-chain storage (PostgreSQL/SQLite),
 * SHA-256 canonical hashing, Hardhat/Sepolia blockchain proof anchoring,
 * data integrity verification, and data tampering simulation.
 */

// 1. Get System Status & Stats
exports.getSystemStatus = async (req, res) => {
  try {
    const blockchainStatus = await blockchainService.getStatus();

    const recCountObj = await db.prepare('SELECT COUNT(*) as count FROM sensor_data').get();
    const proofCountObj = await db.prepare('SELECT COUNT(*) as count FROM blockchain_proofs').get();
    const tamperedCountObj = await db.prepare('SELECT COUNT(*) as count FROM sensor_data WHERE is_tampered = 1').get();

    const totalRecords = Number(recCountObj?.count || 0);
    const totalProofs = Number(proofCountObj?.count || 0);
    const tamperedCount = Number(tamperedCountObj?.count || 0);
    const verifiedCount = Math.max(0, totalRecords - tamperedCount);

    return res.json({
      status: 'ONLINE',
      database: db.isPostgres ? 'NEON POSTGRESQL' : 'LOCAL PERSISTENT DB',
      blockchain: blockchainStatus.connected ? 'CONNECTED' : 'DISCONNECTED',
      blockchainDetails: blockchainStatus,
      metrics: {
        totalRecords,
        totalProofs,
        verifiedCount,
        tamperedCount
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2. Get Registered Devices
exports.getDevices = async (req, res) => {
  try {
    const devices = await db.prepare('SELECT * FROM devices ORDER BY id ASC').all();
    return res.json({ devices });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3. Generate Simulated Sensor Reading (Unrecorded)
exports.generateReading = (req, res) => {
  try {
    const { deviceId } = req.body || {};
    const reading = simulator.generateReading(deviceId || 'ENV_SENSOR_001');
    const canonical = canonicalizeSensorData(reading);
    const hash = generateSHA256Hash(reading);

    return res.json({
      reading,
      canonicalRepresentation: canonical,
      calculatedHash: hash
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 4. Generate AND Record Reading (Store Off-Chain + Anchor On Smart Contract)
exports.recordSensorData = async (req, res) => {
  try {
    let reading = req.body.reading;
    const deviceId = req.body.deviceId || (reading ? reading.device_id : 'ENV_SENSOR_001');

    if (!reading) {
      reading = simulator.generateReading(deviceId);
    }

    // Step A: Generate SHA-256 hash from canonical data
    const canonicalStr = canonicalizeSensorData(reading);
    const dataHash = generateSHA256Hash(reading);

    // Step B: Insert into off-chain table
    const stmt = db.prepare(`
      INSERT INTO sensor_data (device_id, temperature, humidity, timestamp, sequence, data_hash, is_tampered)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    const result = await stmt.run(
      reading.device_id,
      reading.temperature,
      reading.humidity,
      reading.timestamp,
      reading.sequence,
      dataHash
    );

    const recordId = Number(result.lastInsertRowid);

    // Step C: Record proof on Smart Contract (Sepolia or Hardhat)
    let blockchainResult = null;
    let blockchainError = null;

    try {
      blockchainResult = await blockchainService.recordDataProof(
        recordId,
        dataHash,
        reading.device_id,
        reading.timestamp
      );

      // Update off-chain database with TX hash and Block Number
      await db.prepare(`
        UPDATE sensor_data
        SET transaction_hash = ?, block_number = ?
        WHERE id = ?
      `).run(blockchainResult.transactionHash, blockchainResult.blockNumber, recordId);

      // Insert into off-chain blockchain_proofs table
      await db.prepare(`
        INSERT INTO blockchain_proofs (data_id, data_hash, transaction_hash, block_number)
        VALUES (?, ?, ?, ?)
      `).run(recordId, dataHash, blockchainResult.transactionHash, blockchainResult.blockNumber);

    } catch (bcErr) {
      console.warn(`Blockchain anchoring failed for record #${recordId}:`, bcErr.message);
      blockchainError = bcErr.message;
    }

    const updatedRecord = await db.prepare('SELECT * FROM sensor_data WHERE id = ?').get(recordId);

    return res.status(201).json({
      message: 'Sensor record created successfully',
      record: updatedRecord,
      canonicalRepresentation: canonicalStr,
      dataHash,
      blockchain: blockchainResult || { status: 'FAILED', error: blockchainError }
    });

  } catch (err) {
    console.error('Error in recordSensorData:', err);
    return res.status(500).json({ error: err.message });
  }
};

// 5. Get All Sensor Records
exports.getAllSensorData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const records = await db.prepare(`
      SELECT * FROM sensor_data 
      ORDER BY id DESC 
      LIMIT ?
    `).all(limit);

    return res.json({ records });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 6. Get Single Record & Provenance History
exports.getProvenanceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await db.prepare('SELECT * FROM sensor_data WHERE id = ?').get(id);

    if (!record) {
      return res.status(404).json({ error: `Record #${id} not found` });
    }

    const proof = await db.prepare('SELECT * FROM blockchain_proofs WHERE data_id = ?').get(id);
    const onChainProof = await blockchainService.getDataProof(id);

    const canonicalCurrent = canonicalizeSensorData({
      device_id: record.device_id,
      temperature: record.temperature,
      humidity: record.humidity,
      timestamp: record.timestamp,
      sequence: record.sequence
    });
    const currentHash = generateSHA256Hash({
      device_id: record.device_id,
      temperature: record.temperature,
      humidity: record.humidity,
      timestamp: record.timestamp,
      sequence: record.sequence
    });

    return res.json({
      record,
      offChainProof: proof,
      onChainProof,
      canonicalCurrent,
      recalculatedHash: currentHash,
      isTampered: Boolean(record.is_tampered)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 7. Verify Data Integrity (Re-Calculate Hash vs Blockchain Proof)
exports.verifyRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await db.prepare('SELECT * FROM sensor_data WHERE id = ?').get(id);

    if (!record) {
      return res.status(404).json({
        status: 'VERIFICATION_ERROR',
        message: `Sensor record #${id} not found in database.`
      });
    }

    // Step A: Recalculate hash from CURRENT database state
    const canonicalCurrent = canonicalizeSensorData({
      device_id: record.device_id,
      temperature: record.temperature,
      humidity: record.humidity,
      timestamp: record.timestamp,
      sequence: record.sequence
    });
    const recalculatedHash = generateSHA256Hash({
      device_id: record.device_id,
      temperature: record.temperature,
      humidity: record.humidity,
      timestamp: record.timestamp,
      sequence: record.sequence
    });

    // Step B: Query immutable proof from Smart Contract
    const onChainProof = await blockchainService.getDataProof(id);

    if (!onChainProof || !onChainProof.exists) {
      return res.json({
        status: 'PROOF_NOT_FOUND',
        recordId: Number(id),
        message: 'No on-chain proof found for this record ID on the blockchain.',
        recalculatedHash,
        canonicalRepresentation: canonicalCurrent,
        storedDatabaseHash: record.data_hash
      });
    }

    const blockchainHash = onChainProof.dataHash;
    const isMatch = recalculatedHash.toLowerCase() === blockchainHash.toLowerCase();

    return res.json({
      status: isMatch ? 'VERIFIED' : 'TAMPER_DETECTED',
      recordId: Number(id),
      record,
      canonicalRepresentation: canonicalCurrent,
      recalculatedHash,
      blockchainHash,
      storedDatabaseHash: record.data_hash,
      isMatch,
      blockchainMetadata: {
        transactionHash: record.transaction_hash,
        blockNumber: record.block_number,
        blockTimestamp: onChainProof.blockTimestamp,
        recordedBy: onChainProof.recordedBy,
        deviceId: onChainProof.deviceId
      },
      auditReport: isMatch
        ? 'Data integrity confirmed. Recalculated off-chain SHA-256 hash matches immutable on-chain proof exact match.'
        : 'CRITICAL ALERT: Tamper detected! Current database sensor values produce a hash that DOES NOT MATCH the immutable cryptographic proof recorded on the blockchain.'
    });

  } catch (err) {
    console.error(`Error verifying record #${req.params.id}:`, err);
    return res.status(500).json({
      status: 'VERIFICATION_ERROR',
      error: err.message
    });
  }
};

// 8. Controlled Tampering Demonstration (Mutates Off-Chain Record)
exports.tamperRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTemperature, newHumidity } = req.body || {};

    const record = await db.prepare('SELECT * FROM sensor_data WHERE id = ?').get(id);

    if (!record) {
      return res.status(404).json({ error: `Record #${id} not found` });
    }

    const originalTemp = record.temperature;
    const originalHumidity = record.humidity;
    const originalHash = record.data_hash;

    // Mutate temperature (default add +10.0°C if not specified)
    const tamperedTemp = newTemperature !== undefined ? Number(newTemperature) : Number((record.temperature + 10.0).toFixed(2));
    const tamperedHumidity = newHumidity !== undefined ? Number(newHumidity) : record.humidity;

    // Compute new mutated hash for demonstration
    const mutatedReading = {
      device_id: record.device_id,
      temperature: tamperedTemp,
      humidity: tamperedHumidity,
      timestamp: record.timestamp,
      sequence: record.sequence
    };
    const newMutatedHash = generateSHA256Hash(mutatedReading);

    // Update off-chain database (Intentionally corrupting off-chain data)
    await db.prepare(`
      UPDATE sensor_data
      SET temperature = ?, humidity = ?, is_tampered = 1
      WHERE id = ?
    `).run(tamperedTemp, tamperedHumidity, id);

    const updatedRecord = await db.prepare('SELECT * FROM sensor_data WHERE id = ?').get(id);

    return res.json({
      message: `Database record #${id} successfully tampered for demonstration`,
      recordId: Number(id),
      before: {
        temperature: originalTemp,
        humidity: originalHumidity,
        dataHash: originalHash
      },
      after: {
        temperature: updatedRecord.temperature,
        humidity: updatedRecord.humidity,
        newCalculatedHash: newMutatedHash
      },
      blockchainProofStatus: 'IMMUTABLE (Blockchain hash remains unchanged on smart contract)',
      nextStep: `Run POST /api/verify/${id} to see TAMPER DETECTED alert!`
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
