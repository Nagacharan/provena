const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying IoTDataProvenance smart contract...");

  const IoTDataProvenance = await hre.ethers.getContractFactory("IoTDataProvenance");
  const contract = await IoTDataProvenance.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`IoTDataProvenance deployed to: ${contractAddress}`);

  // Export deployment ABI and Address to backend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/IoTDataProvenance.sol/IoTDataProvenance.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    abi: artifact.abi,
    deployedAt: new Date().toISOString()
  };

  const backendDir = path.join(__dirname, "../../backend/config");
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }

  const outputPath = path.join(backendDir, "contractInfo.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Saved deployment info to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
