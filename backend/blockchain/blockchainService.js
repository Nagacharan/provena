const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Fallback embedded ABI for IoTDataProvenance smart contract
const CONTRACT_ABI = [
  "function registerDevice(string memory deviceId) external",
  "function isDeviceRegistered(string memory deviceId) external view returns (bool)",
  "function recordDataProof(uint256 recordId, bytes32 dataHash, string memory deviceId, uint256 timestamp) external",
  "function getDataProof(uint256 recordId) external view returns (uint256 id, bytes32 dataHash, string memory deviceId, uint256 timestamp, uint256 blockTimestamp, address recordedBy, bool exists)",
  "function verifyData(uint256 recordId, bytes32 expectedHash) external view returns (bool isValid, bytes32 actualHash)",
  "function getProofCount() external view returns (uint256)",
  "event DeviceRegistered(string indexed deviceId, uint256 registeredAt)",
  "event DataProofRecorded(uint256 indexed recordId, bytes32 indexed dataHash, string deviceId, uint256 timestamp, uint256 blockTimestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = null;
    this.isInitialized = false;
    this.rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL || 'http://127.0.0.1:8545';
  }

  /**
   * Initializes connection to Ethereum Blockchain (Sepolia Testnet or Local Hardhat).
   */
  async init() {
    try {
      this.rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL || 'http://127.0.0.1:8545';
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      // Test provider connection
      const network = await this.provider.getNetwork();

      // Private Key configuration (Default Hardhat Key #0 for local dev fallback)
      const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      let abi = CONTRACT_ABI;
      let address = process.env.CONTRACT_ADDRESS;

      // Check local contractInfo.json artifact
      const configPath = path.join(__dirname, '../config/contractInfo.json');
      if (fs.existsSync(configPath)) {
        try {
          const contractInfo = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          if (!address) address = contractInfo.address;
          if (contractInfo.abi) abi = contractInfo.abi;
        } catch (e) {
          console.warn('Could not parse contractInfo.json, using environment fallback.');
        }
      }

      if (!address) {
        // Fallback default address from hardhat local deployment
        address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      }

      this.contractAddress = address;
      this.contract = new ethers.Contract(this.contractAddress, abi, this.wallet);

      this.isInitialized = true;
      console.log(`BlockchainService initialized: Network Chain ID ${network.chainId}, Contract at ${this.contractAddress} via ${this.rpcUrl}`);
      return true;
    } catch (err) {
      console.warn(`BlockchainService initialization warning: ${err.message}`);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Submits a data proof (SHA-256 hash) to the IoTDataProvenance smart contract.
   */
  async recordDataProof(recordId, dataHash, deviceId, timestamp) {
    if (!this.isInitialized) {
      const ok = await this.init();
      if (!ok) {
        throw new Error('Blockchain network unavailable. Please verify RPC_URL and contract deployment configuration.');
      }
    }

    try {
      const unixTs = typeof timestamp === 'number' ? timestamp : Math.floor(new Date(timestamp).getTime() / 1000);
      const tx = await this.contract.recordDataProof(recordId, dataHash, deviceId, unixTs);
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : '0',
        contractAddress: this.contractAddress
      };
    } catch (err) {
      console.error('Error recording proof on blockchain:', err);
      throw new Error(`Smart contract transaction failed: ${err.reason || err.message}`);
    }
  }

  /**
   * Retrieves data proof stored on-chain for a record ID.
   */
  async getDataProof(recordId) {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.isInitialized) {
      return null;
    }

    try {
      const proof = await this.contract.getDataProof(recordId);
      if (!proof.exists) {
        return null;
      }

      return {
        recordId: Number(proof.id),
        dataHash: proof.dataHash,
        deviceId: proof.deviceId,
        timestamp: Number(proof.timestamp),
        blockTimestamp: Number(proof.blockTimestamp),
        recordedBy: proof.recordedBy,
        exists: proof.exists
      };
    } catch (err) {
      console.error(`Error fetching on-chain proof for record ${recordId}:`, err);
      return null;
    }
  }

  /**
   * Returns system status for API health checks.
   */
  async getStatus() {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      if (!this.provider) {
        return { connected: false, message: 'Provider uninitialized' };
      }

      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      const proofCount = this.contract ? Number(await this.contract.getProofCount()) : 0;

      return {
        connected: true,
        rpcUrl: this.rpcUrl,
        chainId: Number(network.chainId),
        networkName: Number(network.chainId) === 11155111 ? 'sepolia' : 'localhost',
        latestBlock: blockNumber,
        contractAddress: this.contractAddress,
        totalProofsAnchored: proofCount
      };
    } catch (err) {
      return {
        connected: false,
        rpcUrl: this.rpcUrl,
        error: err.message
      };
    }
  }
}

module.exports = new BlockchainService();
