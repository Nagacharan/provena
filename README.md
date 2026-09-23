# Provena: IoT Data Provenance & Verification System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-brightgreen.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.5-yellow.svg)](https://hardhat.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-blue.svg)](https://sepolia.etherscan.io/)
[![Express](https://img.shields.io/badge/Express-4.19-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://reactjs.org/)

**Provena** is a full-stack, enterprise-grade, tamper-evident data provenance and integrity verification system for Internet of Things (IoT) telemetry, backed by off-chain data storage and on-chain Ethereum smart contract proof anchoring (`IoTDataProvenance.sol`).

---

## 🎯 Core Agenda

> **"Generate simulated IoT telemetry, compute a deterministic SHA-256 cryptographic fingerprint, store the actual dataset off-chain (PostgreSQL/SQLite), anchor its hash proof on an Ethereum blockchain (Sepolia / Hardhat), and allow anyone to independently verify whether the off-chain data has been modified after recording."**

---

## 🏗️ Production Architecture ($0 Free Tier Stack)

```text
                    GitHub Repository
                            |
           +----------------+----------------+
           |                                 |
           v                                 v
   Cloudflare Pages                     Render
  Static React/Vite                   Free Web Service
 (Frontend Hosting)                 (Express Backend API)
                                             |
                      +----------------------+----------------------+
                      |                                             |
                      v                                             v
               Neon PostgreSQL                            Ethereum Sepolia
          (Off-Chain Data Storage)                   (On-Chain Provenance Anchors)
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, hosted on **Cloudflare Pages**.
- **Backend API**: Node.js, Express.js, SHA-256 Cryptographic Engine (`crypto`), hosted on **Render Web Service**.
- **Off-Chain Storage**: **Neon PostgreSQL** (Production) / Persistent Local Database (Local Dev).
- **On-Chain Blockchain**: **Ethereum Sepolia Testnet** / Local Hardhat Node via `ethers.js v6`.
- **Smart Contract**: Solidity (`0.8.24`) - `IoTDataProvenance.sol`.

---

## 🔄 Cryptographic Provenance Workflow

```text
SIMULATED IoT SENSOR (ENV_SENSOR_001)
         │
         ▼
 SENSOR TELEMETRY GENERATED
         │
         ▼
DETERMINISTIC CANONICAL JSON
         │
         ▼
  SHA-256 HASH GENERATED
         │
 ┌───────┴────────┐
 │                │
 ▼                ▼
OFF-CHAIN      ON-CHAIN PROOF
SQLite / Neon   Sepolia Smart Contract
PostgreSQL      (IoTDataProvenance.sol)
 │                │
 └───────┬────────┘
         │
         ▼
VERIFICATION ENGINE AUDIT
         │
         ▼
HASH COMPARISON (Off-Chain Recalculated vs On-Chain Immutable)
         │
 ┌───────┴────────┐
 │                │
 ▼                ▼
✓ VERIFIED    ✕ TAMPER DETECTED
```

---

## 🚀 Local Development Setup

### 1. Hardhat Blockchain Setup
```bash
cd blockchain
node ./node_modules/hardhat/internal/cli/cli.js test     # Run smart contract tests
node ./node_modules/hardhat/internal/cli/cli.js node     # Start local node (port 8545)
```
In a new terminal:
```bash
cd blockchain
node ./node_modules/hardhat/internal/cli/cli.js run scripts/deploy.js --network localhost
```

### 2. Backend Server Setup
```bash
cd backend
node server.js
```
*Runs at `http://localhost:5000`.*

### 3. Frontend Dashboard Setup
```bash
cd frontend
node ./node_modules/vite/bin/vite.js
```
*Runs at `http://localhost:3000`.*

---

## 🌐 Production Deployment Guide

For full zero-cost production deployment instructions using GitHub, Neon PostgreSQL, Sepolia Testnet, Render, and Cloudflare Pages, see **[docs/deployment.md](file:///d:/Work%20Space/Projects/Iot_Data_Provenance%20&%20Verification/docs/deployment.md)**.

---

## 🧪 Demonstration & Verification Guide

1. Open the application dashboard (`http://localhost:3000` locally or your Cloudflare Pages URL).
2. Click **"Generate & Anchor Reading"** to generate an IoT reading and submit a blockchain transaction.
3. Click **"Verify Audit"** to confirm that recalculated SHA-256 hash matches the on-chain proof (**`✓ VERIFIED INTACT`**).
4. Click **"Tamper Demo Sandbox"** and click **"Corrupt Off-Chain Database Record"** (modifying off-chain temperature e.g. 24.7°C -> 38.6°C).
5. Click **"Run Verification Audit Now"** to observe the instant **`✕ TAMPER DETECTED`** alert showing the exact cryptographic hash diff.

---

## 🛡️ Security Boundary Note

> **Data Integrity vs Physical Sensor Calibration**:
> Provena proves that *recorded telemetry has not been modified after the blockchain proof transaction was mined*. It does not guarantee physical sensor hardware calibration prior to reporting.

---

## 📄 License
MIT License - Open Source Prototype.
