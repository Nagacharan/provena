# Provena: IoT Data Provenance & Verification System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-brightgreen.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.5-yellow.svg)](https://hardhat.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-blue.svg)](https://sepolia.etherscan.io/)
[![Express](https://img.shields.io/badge/Express-4.19-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://reactjs.org/)

**Provena** is a full-stack, enterprise-grade, tamper-evident data provenance and integrity verification system for Internet of Things (IoT) telemetry, backed by off-chain storage and on-chain Ethereum smart contract proof anchoring (`IoTDataProvenance.sol`).

---

## 🎯 Central Purpose

> **"Generate simulated IoT telemetry, compute a deterministic SHA-256 cryptographic fingerprint, store the actual dataset off-chain, anchor its proof on an Ethereum blockchain (Sepolia / Hardhat), and allow anyone using the application to independently verify whether the off-chain data has been modified after recording."**

---

## 🏗️ Unified Single-Service Deployment Architecture ($0 Free Tier)

```text
                       GitHub Repository
                               │
                               ▼
                     Render Free Web Service
                    (ONE Unified Node/Express App)
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
  REST API & Engine                             React SPA UI
 - /api/health                                 - Served from frontend/dist
 - /api/sensor-data/record                     - Client-side SPA routing fallback
 - /api/verify/:id                             - Relative fetch('/api/...')
 - /api/tamper/:id                                    │
 - Off-Chain Storage                                  │
 - Sepolia Blockchain Service                         ▼
        │                                       User Browser
        └──────────────────────┬──────────────────────┘
                               │
                               ▼
                   Single Public Application URL
              (e.g., https://provena.onrender.com)
```

---

## 🛠️ Technology Stack

- **Unified Server**: Node.js & Express serving both `/api/...` endpoints and static built React SPA (`frontend/dist`).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons.
- **Off-Chain Storage**: Persistent Off-Chain Database Engine.
- **On-Chain Blockchain**: **Ethereum Sepolia Testnet** / Local Hardhat Node via `ethers.js v6`.
- **Smart Contract**: Solidity (`0.8.24`) - `IoTDataProvenance.sol`.

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

### 2. Unified Build & Run (Single URL Port 5000)
```bash
npm run build      # Builds frontend static assets to frontend/dist
npm start          # Starts unified server on http://localhost:5000
```
Open `http://localhost:5000` in your web browser.

---

## 🌐 Render Production Deployment

For full zero-cost production deployment instructions using Render Free Web Service, see **[docs/deployment.md](file:///d:/Work%20Space/Projects/Iot_Data_Provenance%20&%20Verification/docs/deployment.md)**.

---

## 🧪 Demonstration & Verification Guide

1. Open `http://localhost:5000` (or your live Render public URL).
2. Click **"Generate & Anchor Reading"** to generate an IoT reading and submit a blockchain transaction.
3. Click **"Verify Audit"** to confirm that recalculated SHA-256 hash matches the on-chain proof (**`✓ VERIFIED INTACT`**).
4. Click **"Tamper Demo Sandbox"** and click **"Corrupt Off-Chain Database Record"** (modifying off-chain temperature e.g. 24.7°C -> 38.6°C).
5. Click **"Run Verification Audit Now"** to observe the instant **`✕ TAMPER DETECTED`** alert showing the exact cryptographic hash diff.

---

## 🛡️ Security & Limitation Notes

- **Data Integrity / Tamper Evidence**: Proven. If off-chain data is altered after proof creation, the recalculated SHA-256 hash will diverge from the smart contract proof.
- **Ephemeral Filesystem Disclosure**: On Render Free, off-chain database records reset when the service spins down or restarts, which is acceptable for hackathon demonstration purposes.

---

## 📄 License
MIT License - Open Source Prototype.
