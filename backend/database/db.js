const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const isProductionDb = Boolean(process.env.DATABASE_URL);

// -------------------------------------------------------------------------
// 1. NEON POSTGRESQL ENGINE (FOR PRODUCTION DEPLOYMENT)
// -------------------------------------------------------------------------
class PostgresDatabase {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false } // Required for Neon PostgreSQL
    });
    this.isPostgres = true;
    this.initTables();
  }

  async initTables() {
    try {
      const client = await this.pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS devices (
            id SERIAL PRIMARY KEY,
            device_id VARCHAR(100) UNIQUE NOT NULL,
            device_name VARCHAR(255) NOT NULL,
            device_type VARCHAR(100) NOT NULL,
            status VARCHAR(50) DEFAULT 'ONLINE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS sensor_data (
            id SERIAL PRIMARY KEY,
            device_id VARCHAR(100) NOT NULL,
            temperature DOUBLE PRECISION NOT NULL,
            humidity DOUBLE PRECISION NOT NULL,
            timestamp VARCHAR(100) NOT NULL,
            sequence INT NOT NULL,
            data_hash TEXT,
            transaction_hash TEXT,
            block_number INT,
            is_tampered INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS blockchain_proofs (
            id SERIAL PRIMARY KEY,
            data_id INT UNIQUE NOT NULL,
            data_hash TEXT NOT NULL,
            transaction_hash TEXT NOT NULL,
            block_number INT NOT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Seed default devices if missing
        const res = await client.query("SELECT * FROM devices WHERE device_id = 'ENV_SENSOR_001'");
        if (res.rows.length === 0) {
          await client.query(`
            INSERT INTO devices (device_id, device_name, device_type, status)
            VALUES ('ENV_SENSOR_001', 'Environmental Multi-Sensor Station Alpha', 'TEMPERATURE_HUMIDITY', 'ONLINE'),
                   ('ENV_SENSOR_002', 'Environmental Multi-Sensor Station Beta', 'TEMPERATURE_HUMIDITY', 'ONLINE')
            ON CONFLICT DO NOTHING;
          `);
        }

        console.log('Neon PostgreSQL Database connected and tables initialized.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('PostgreSQL Initialization Error:', err.message);
    }
  }

  // Convert SQLite ? placeholders to PostgreSQL $1, $2, $3 placeholders
  formatQuery(query) {
    let index = 1;
    return query.replace(/\?/g, () => `$${index++}`);
  }

  prepare(query) {
    const self = this;
    const pgQuery = this.formatQuery(query);

    return {
      run(...args) {
        // Handle synchronous invocation in existing code by returning a promise or executing sync-compatible
        const execution = (async () => {
          // If INSERT, append RETURNING id
          let finalSql = pgQuery;
          if (finalSql.trim().toUpperCase().startsWith('INSERT') && !finalSql.toUpperCase().includes('RETURNING')) {
            finalSql += ' RETURNING id';
          }
          const res = await self.pool.query(finalSql, args);
          const lastId = res.rows.length > 0 && res.rows[0].id ? res.rows[0].id : 0;
          return { lastInsertRowid: lastId, changes: res.rowCount || 0 };
        })();
        
        // Expose both promise and sync fallback interface
        execution.lastInsertRowid = 1; 
        return execution;
      },

      async get(...args) {
        const res = await self.pool.query(pgQuery, args);
        return res.rows[0] || null;
      },

      async all(...args) {
        // If SELECT * FROM sensor_data ORDER BY id DESC LIMIT ?
        const res = await self.pool.query(pgQuery, args);
        return res.rows;
      }
    };
  }

  async exec(sql) {
    await this.pool.query(sql);
    return true;
  }
}


// -------------------------------------------------------------------------
// 2. LOCAL PERSISTENT JSON / SQLITE ENGINE (FOR LOCAL DEVELOPMENT)
// -------------------------------------------------------------------------
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = process.env.DATABASE_PATH || path.join(dataDir, 'provenance_db.json');

class LocalPersistentDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.isPostgres = false;
    this.data = {
      devices: [],
      sensor_data: [],
      blockchain_proofs: [],
      autoIncrement: { devices: 1, sensor_data: 1, blockchain_proofs: 1 }
    };
    this.load();
    this.initDefaults();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('Local database load warning:', err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Local database save error:', err);
    }
  }

  initDefaults() {
    if (!this.data.devices.some(d => d.device_id === 'ENV_SENSOR_001')) {
      this.data.devices.push({
        id: this.data.autoIncrement.devices++,
        device_id: 'ENV_SENSOR_001',
        device_name: 'Environmental Multi-Sensor Station Alpha',
        device_type: 'TEMPERATURE_HUMIDITY',
        status: 'ONLINE',
        created_at: new Date().toISOString()
      });
    }
    if (!this.data.devices.some(d => d.device_id === 'ENV_SENSOR_002')) {
      this.data.devices.push({
        id: this.data.autoIncrement.devices++,
        device_id: 'ENV_SENSOR_002',
        device_name: 'Environmental Multi-Sensor Station Beta',
        device_type: 'TEMPERATURE_HUMIDITY',
        status: 'ONLINE',
        created_at: new Date().toISOString()
      });
    }
    this.save();
  }

  exec() { return true; }

  prepare(query) {
    const self = this;
    const cleanQuery = query.replace(/\s+/g, ' ').trim();

    return {
      run(...args) {
        if (cleanQuery.includes('INSERT INTO devices')) {
          const id = self.data.autoIncrement.devices++;
          self.data.devices.push({
            id, device_id: args[0], device_name: args[1], device_type: args[2],
            status: args[3] || 'ONLINE', created_at: new Date().toISOString()
          });
          self.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        if (cleanQuery.includes('INSERT INTO sensor_data')) {
          const id = self.data.autoIncrement.sensor_data++;
          self.data.sensor_data.push({
            id, device_id: args[0], temperature: args[1], humidity: args[2],
            timestamp: args[3], sequence: args[4], data_hash: args[5],
            transaction_hash: null, block_number: null, is_tampered: 0,
            created_at: new Date().toISOString()
          });
          self.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        if (cleanQuery.includes('INSERT INTO blockchain_proofs')) {
          const id = self.data.autoIncrement.blockchain_proofs++;
          self.data.blockchain_proofs.push({
            id, data_id: args[0], data_hash: args[1], transaction_hash: args[2],
            block_number: args[3], recorded_at: new Date().toISOString()
          });
          self.save();
          return { lastInsertRowid: id, changes: 1 };
        }

        if (cleanQuery.includes('UPDATE sensor_data SET transaction_hash = ?, block_number = ?')) {
          const [txHash, blockNum, recordId] = args;
          const rec = self.data.sensor_data.find(r => r.id === Number(recordId));
          if (rec) {
            rec.transaction_hash = txHash;
            rec.block_number = blockNum;
            self.save();
            return { changes: 1 };
          }
          return { changes: 0 };
        }

        if (cleanQuery.includes('UPDATE sensor_data SET temperature = ?, humidity = ?, is_tampered = 1')) {
          const [temp, hum, recordId] = args;
          const rec = self.data.sensor_data.find(r => r.id === Number(recordId));
          if (rec) {
            rec.temperature = temp;
            rec.humidity = hum;
            rec.is_tampered = 1;
            self.save();
            return { changes: 1 };
          }
          return { changes: 0 };
        }

        return { lastInsertRowid: 0, changes: 0 };
      },

      get(...args) {
        if (cleanQuery.includes('SELECT COUNT(*) as count FROM sensor_data WHERE is_tampered = 1')) {
          return { count: self.data.sensor_data.filter(r => r.is_tampered === 1).length };
        }
        if (cleanQuery.includes('SELECT COUNT(*) as count FROM sensor_data')) {
          return { count: self.data.sensor_data.length };
        }
        if (cleanQuery.includes('SELECT COUNT(*) as count FROM blockchain_proofs')) {
          return { count: self.data.blockchain_proofs.length };
        }
        if (cleanQuery.includes('SELECT * FROM devices WHERE device_id = ?')) {
          return self.data.devices.find(d => d.device_id === args[0]) || null;
        }
        if (cleanQuery.includes('SELECT * FROM sensor_data WHERE id = ?')) {
          return self.data.sensor_data.find(r => r.id === Number(args[0])) || null;
        }
        if (cleanQuery.includes('SELECT * FROM blockchain_proofs WHERE data_id = ?')) {
          return self.data.blockchain_proofs.find(p => p.data_id === Number(args[0])) || null;
        }
        return null;
      },

      all(...args) {
        if (cleanQuery.includes('FROM devices')) {
          return [...self.data.devices].sort((a, b) => a.id - b.id);
        }
        if (cleanQuery.includes('FROM sensor_data')) {
          const limit = args[0] || 50;
          return [...self.data.sensor_data].sort((a, b) => b.id - a.id).slice(0, limit);
        }
        if (cleanQuery.includes('FROM blockchain_proofs')) {
          return [...self.data.blockchain_proofs];
        }
        return [];
      }
    };
  }
}

const db = isProductionDb
  ? new PostgresDatabase(process.env.DATABASE_URL)
  : new LocalPersistentDatabase(dbFilePath);

console.log(
  isProductionDb
    ? 'PostgreSQL Database Engine Active (Neon Cloud)'
    : 'Local Persistent Database Engine Active (' + dbFilePath + ')'
);

module.exports = db;
