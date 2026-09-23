# Provena: Production Deployment Guide ($0 Free Tier)

This guide provides step-by-step instructions for deploying **Provena** to a long-term **$0 recurring cost production environment**.

---

## 🏗️ Target Production Stack & Provider Free Tiers

| Layer | Provider / Platform | Free Tier Specifications & Limits |
| :--- | :--- | :--- |
| **Frontend** | **Cloudflare Pages** | Unlimited bandwidth, 500 builds/month, static React/Vite |
| **Backend** | **Render Web Service** | 512 MB RAM, spins down after 15m inactivity (cold start ~20s) |
| **Database** | **Neon PostgreSQL** | 0.5 GiB storage, auto-suspend after inactivity |
| **Blockchain** | **Ethereum Sepolia Testnet** | Free testnet ETH via Sepolia Faucets |
| **RPC** | **Alchemy / Infura / Public** | Free Sepolia RPC endpoints (e.g. `https://rpc.sepolia.org`) |

---

## 📋 Step-by-Step Deployment Procedure

### STEP 1: GitHub Repository Setup
1. Create a public or private GitHub repository named `provena`.
2. Push your project code:
```bash
git init
git add .
git commit -m "Initial commit for Provena production deployment"
git remote add origin https://github.com/YOUR_USERNAME/provena.git
git branch -M main
git push -u origin main
```
*Note: Ensure `.gitignore` prevents `.env`, `node_modules`, `dist/`, and private keys from being committed.*

---

### STEP 2: Neon PostgreSQL Database Setup
1. Sign up at [neon.tech](https://neon.tech) (Free Tier).
2. Create a project named `provena-db`.
3. Copy your PostgreSQL Connection String from the Neon dashboard:
   `postgres://USER:PASSWORD@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`
4. Keep this connection string for your Render environment variables (`DATABASE_URL`).

---

### STEP 3: Ethereum Sepolia Smart Contract Deployment
1. Obtain Sepolia testnet ETH from a free faucet (e.g. `sepoliafaucet.com` or `alchemy.com/faucets/ethereum-sepolia`).
2. Add your wallet private key and Sepolia RPC URL to `.env`:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY
```
3. Deploy `IoTDataProvenance.sol` to Sepolia testnet:
```bash
cd blockchain
node ./node_modules/hardhat/internal/cli/cli.js run scripts/deploy.js --network sepolia
```
4. Copy the deployed contract address output (e.g. `0x1234...5678`) for your Render backend configuration (`CONTRACT_ADDRESS`).

---

### STEP 4: Render Backend Deployment
1. Sign up at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `provena`.
4. Configure service settings:
   - **Name**: `provena-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add Environment Variables in the Render dashboard:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<your_neon_postgresql_url>`
   - `SEPOLIA_RPC_URL` = `<your_sepolia_rpc_url>`
   - `PRIVATE_KEY` = `<your_wallet_private_key>`
   - `CONTRACT_ADDRESS` = `<your_sepolia_contract_address>`
   - `FRONTEND_URL` = `https://provena.pages.dev` (or your Cloudflare Pages URL)
6. Click **Deploy Web Service**. Render will output your live API URL (e.g. `https://provena-backend.onrender.com`).

---

### STEP 5: Cloudflare Pages Frontend Deployment
1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com).
2. Click **Create a project** -> **Connect to Git**.
3. Select your repository `provena`.
4. Configure build settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://provena-backend.onrender.com`
6. Click **Save and Deploy**. Cloudflare Pages will build and host your frontend statically at `https://provena.pages.dev`.

---

## 🔍 Verification & Health Checks

Once deployed:
1. Open `https://provena-backend.onrender.com/api/health` in your browser to confirm backend health:
```json
{
  "status": "ok",
  "service": "provena-backend",
  "database": "neon-postgresql"
}
```
2. Open your live Cloudflare Pages frontend (`https://provena.pages.dev`).
3. Click **"Generate & Anchor Reading"** to run a live Sepolia blockchain proof transaction.
4. Click **"Verify Audit"** to observe `VERIFIED INTACT`.
5. Run **"Tamper Demo Sandbox"** to test off-chain corruption vs on-chain immutability.

---

## ⚠️ Free Tier Limitations & Disclosures

1. **Render Cold Starts**: Render Free Web Services spin down after 15 minutes of inactivity. The first request after a spin-down may take ~15-25 seconds to wake up. Provena UI includes automatic retry indicators to handle cold starts gracefully.
2. **Neon Inactivity Suspend**: Neon free databases auto-suspend when idle for several hours and automatically resume upon incoming connection.
3. **Sepolia Gas Faucets**: Sepolia testnet ETH is free from public faucets and does not involve real monetary funds.
