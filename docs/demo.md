# Live Demonstration Walkthrough Guide

Follow these 5 simple steps to demonstrate the **IoT Data Provenance & Verification System** to evaluators or judges.

---

## Step 1: Open the Application Dashboard
Navigate to `http://localhost:3000`.
Notice the top status header showing:
- **API: ONLINE**
- **SQLite: OFF-CHAIN DB**
- **Hardhat Node: ON-CHAIN**

---

## Step 2: Generate & Anchor Sensor Reading
1. Click the **"Generate & Anchor Reading"** button on the Dashboard.
2. Observe the new sensor record appearing in the **Recent Off-Chain Sensor Records** table.
3. Note the generated **SHA-256 Hash** (`0x...`) and the mined **Hardhat Block Number**.

---

## Step 3: Run Initial Integrity Audit
1. Click the **"Verify Audit"** button next to the newly created record.
2. The UI transitions to the **Verification Engine** page.
3. Observe the prominent green **`✓ VERIFIED INTACT`** banner.
4. Compare the **Recalculated SHA-256 Hash** on the left with the **On-Chain Anchored Hash** on the right. Both match character-for-character.

---

## Step 4: Execute Data Tampering Sandbox
1. Click the **"Tamper Demo Sandbox"** tab in the main navigation.
2. Select Record `#1`.
3. Leave the temperature modified to e.g. `38.6°C` (a +10°C jump).
4. Click **"Corrupt Off-Chain Database Record"**.
5. Read the alert explaining that the SQLite database record has been mutated while the Hardhat smart contract proof remains unchanged.

---

## Step 5: Verify Again & Catch Tampering
1. Click **"Run Verification Audit Now"**.
2. The UI instantly displays the crimson **`✕ TAMPER DETECTED`** alert.
3. Observe the cryptographic hash diff:
   - **Original Blockchain Proof**: `0xa5d556...`
   - **Current Recalculated Hash**: `0x2e620b...`
4. This completes the core demonstration of blockchain-backed data provenance!
