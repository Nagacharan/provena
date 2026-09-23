# API Reference Documentation

Base URL: `http://localhost:5000/api`

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/system/status` | System health check (API, SQLite, Hardhat Node, Metrics) |
| `GET` | `/api/devices` | List registered virtual IoT sensors |
| `POST` | `/api/sensor-data/generate` | Generate unrecorded simulated sensor reading |
| `POST` | `/api/sensor-data/record` | Generate SHA-256, save off-chain to SQLite, and anchor proof on Hardhat contract |
| `GET` | `/api/sensor-data` | List recent sensor records |
| `GET` | `/api/provenance/:id` | Detailed off-chain and on-chain record provenance |
| `POST` | `/api/verify/:id` | Recalculate hash from database vs on-chain smart contract proof |
| `POST` | `/api/tamper/:id` | Mutate off-chain SQLite values to demonstrate tamper detection |

---

## Endpoint Details

### 1. `GET /api/system/status`
Returns connectivity states and high-level statistics.
```json
{
  "status": "ONLINE",
  "database": "CONNECTED",
  "blockchain": "CONNECTED",
  "blockchainDetails": {
    "connected": true,
    "rpcUrl": "http://127.0.0.1:8545",
    "chainId": 31337,
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "totalProofsAnchored": 1
  },
  "metrics": {
    "totalRecords": 1,
    "totalProofs": 1,
    "verifiedCount": 1,
    "tamperedCount": 0
  }
}
```

### 2. `POST /api/sensor-data/record`
Generates a new sensor telemetry reading, canonicalizes it, computes standard SHA-256, inserts into SQLite, and submits transaction to Hardhat smart contract.
```json
{
  "message": "Sensor record created successfully",
  "record": {
    "id": 1,
    "device_id": "ENV_SENSOR_001",
    "temperature": 24.71,
    "humidity": 57.98,
    "timestamp": "2026-09-22T14:27:41.813Z",
    "sequence": 1002,
    "data_hash": "0xa5d556dc6863099a58ab1716fdbe5229841790d22770108c40415bb029f6436a",
    "transaction_hash": "0x38b7dc161845f58e46ef2a3b2aef3daab08ba576859be39d3eed00b94f21c21a",
    "block_number": 2,
    "is_tampered": 0
  }
}
```

### 3. `POST /api/verify/:id`
Recalculates SHA-256 hash from off-chain database and compares it to the on-chain proof.
Returns `status: "VERIFIED"` if matching or `status: "TAMPER_DETECTED"` if mismatched.
