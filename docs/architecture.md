# System Architecture & Technical Specifications

## 1. System Context & Overview

The **IoT Data Provenance & Verification System** addresses the critical challenge of trust and tamper-detection in Internet of Things (IoT) data streams.

Physical or simulated IoT devices continuously generate high-volume environmental telemetry. Storing all raw telemetry directly on a public or enterprise blockchain is cost-prohibitive and inefficient. 

To overcome this, our system implements a hybrid **Off-Chain Data / On-Chain Provenance** architecture:
- **Off-Chain Layer (SQLite)**: Stores full raw telemetry (temperature, humidity, device metadata, timestamp, sequence number).
- **On-Chain Layer (Hardhat Ethereum Smart Contract)**: Stores immutable 256-bit cryptographic SHA-256 fingerprints (proofs) of canonicalized sensor records.

---

## 2. End-to-End Architectural Diagram

```
+---------------------------------------------------------------------------------+
|                              SIMULATED IoT SENSOR                               |
|                  (ENV_SENSOR_001 Smooth Random Walk Generator)                 |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                              NODE.JS BACKEND API                                |
|  - Deterministic Key Order Canonicalizer                                         |
|  - SHA-256 Cryptographic Hash Generator (0x...)                                |
+-------------------+------------------------------------+------------------------+
                    |                                    |
   Off-Chain Storage|                                    | On-Chain Anchor
                    v                                    v
+-------------------+--------------------+  +------------+------------------------+
|      OFF-CHAIN SQLITE DATABASE         |  |   HARDHAT LOCAL ETHEREUM NODE      |
|  - Table: sensor_data                  |  |  - Contract: IoTDataProvenance.sol     |
|  - Stores: Raw JSON, Temp, Humidity    |  |  - Function: recordDataProof(...)      |
|    Data Hash, Transaction Hash         |  |  - Stores: bytes32 dataHash, deviceId   |
+-------------------+--------------------+  +------------+------------------------+
                    |                                    |
                    +------------------+-----------------+
                                       |
                                       v
+--------------------------------------+------------------------------------------+
|                            VERIFICATION ENGINE                                  |
|  1. Recalculates SHA-256 from current SQLite database values                   |
|  2. Fetches immutable hash from IoTDataProvenance smart contract                |
|  3. Compares Hashes -> VERIFIED (Match) vs TAMPER DETECTED (Mismatch)           |
+--------------------------------------+------------------------------------------+
                                       |
                                       v
+--------------------------------------+------------------------------------------+
|                            REACT / VITE FRONTEND                                |
|  - Interactive Health Monitors, Audit Sandbox, & Tampering Demonstration       |
+---------------------------------------------------------------------------------+
```

---

## 3. Cryptographic Hashing Protocol & Canonicalization

To guarantee that valid data always yields identical hashes regardless of object key order or JSON whitespace variation, sensor payload objects are canonicalized before hashing:

1. **Normalized Data Payload**:
```json
{
  "device_id": "ENV_SENSOR_001",
  "humidity": 57.98,
  "sequence": 1002,
  "temperature": 24.71,
  "timestamp": "2026-09-22T14:27:41.813Z"
}
```

2. **Keys Sorted Alphabetically**: Enforces strict `device_id` -> `humidity` -> `sequence` -> `temperature` -> `timestamp` sequence.
3. **SHA-256 Execution**: `crypto.createHash('sha256').update(canonicalJSON).digest('hex')` producing a `0x`-prefixed 256-bit string compatible with Solidity `bytes32`.

---

## 4. Security & Trust Boundaries

> [!IMPORTANT]
> **Data Integrity vs Sensor Truth Boundary**:
> The system guarantees **Data Integrity and Tamper Evidence after recording** ("The stored reading has not been altered since the blockchain proof was mined").
> It does not guarantee physical sensor calibration truth ("The sensor itself was not physically manipulated before reporting").
