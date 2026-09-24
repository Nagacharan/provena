# Provena: Unified Single-Service Render Deployment Guide ($0 Free Tier)

This guide provides step-by-step instructions for deploying **Provena** as **ONE unified Render Web Service** from **ONE GitHub repository**.

---

## 🏗️ Target Unified Single-Service Architecture

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
 - Persistent Off-Chain Storage                       │
 - Sepolia Blockchain Service                         ▼
        │                                       User Browser
        └──────────────────────┬──────────────────────┘
                               │
                               ▼
                   Single Public Application URL
              (e.g., https://provena.onrender.com)
```

---

## 📋 Step-by-Step Deployment Instructions

### STEP 1: GitHub Repository Setup
Push the repository to GitHub:
```bash
git add .
git commit -m "Configure Provena unified single-service deployment for Render"
git push -u origin main
```

---

### STEP 2: Deploy Smart Contract to Ethereum Sepolia Testnet
1. Obtain Sepolia testnet ETH from a free Sepolia faucet (e.g., `sepoliafaucet.com`).
2. Run the Hardhat deployment script targeting Sepolia:
```bash
cd blockchain
node ./node_modules/hardhat/internal/cli/cli.js run scripts/deploy.js --network sepolia
```
3. Copy the deployed contract address output (e.g. `0x1234...5678`).

---

### STEP 3: Create Render Web Service
1. Log in to [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository (`provena`).
4. Configure service settings:
   - **Name**: `provena`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Configure Environment Variables on Render:
   - `PORT` = `10000`
   - `NODE_ENV` = `production`
   - `SEPOLIA_RPC_URL` = `<your_sepolia_rpc_endpoint>`
   - `PRIVATE_KEY` = `<your_testnet_private_key>`
   - `CONTRACT_ADDRESS` = `<your_sepolia_contract_address>`

6. Click **Deploy Web Service**.
Render will build the React frontend (`frontend/dist`), install Node dependencies, and start the Express server serving both the REST API and the React SPA UI at **ONE public URL** (e.g., `https://provena.onrender.com`).

---

## ⚠️ Important Free Tier Limitations & Disclosures

1. **Render Free Spin-Down & Cold Starts**: Render Free Web Services spin down after 15 minutes of inactivity. The first request after a spin-down may take ~15-20 seconds to wake up. Provena UI includes automatic retry indicators to handle cold starts gracefully.
2. **Ephemeral Filesystem Limitation**: Render Free instances use an ephemeral filesystem. Off-chain SQLite sensor data resets whenever the Render web service restarts, redeploys, or spins down. This is acceptable for hackathon demonstration purposes as it proves the core cryptographic provenance and blockchain verification flow.
