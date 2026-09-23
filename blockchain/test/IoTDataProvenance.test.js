const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IoTDataProvenance Smart Contract", function () {
  let iotProvenance;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const IoTDataProvenance = await ethers.getContractFactory("IoTDataProvenance");
    iotProvenance = await IoTDataProvenance.deploy();
    await iotProvenance.waitForDeployment();
  });

  it("Should record a data proof successfully", async function () {
    const recordId = 101;
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-sensor-data"));
    const deviceId = "ENV_SENSOR_001";
    const timestamp = Math.floor(Date.now() / 1000);

    await expect(iotProvenance.recordDataProof(recordId, dataHash, deviceId, timestamp))
      .to.emit(iotProvenance, "DataProofRecorded");

    const proof = await iotProvenance.getDataProof(recordId);
    expect(proof.id).to.equal(recordId);
    expect(proof.dataHash).to.equal(dataHash);
    expect(proof.deviceId).to.equal(deviceId);
    expect(proof.exists).to.be.true;
  });

  it("Should prevent recording duplicate proof for same record ID", async function () {
    const recordId = 102;
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-sensor-data-2"));
    const deviceId = "ENV_SENSOR_001";
    const timestamp = Math.floor(Date.now() / 1000);

    await iotProvenance.recordDataProof(recordId, dataHash, deviceId, timestamp);

    await expect(
      iotProvenance.recordDataProof(recordId, dataHash, deviceId, timestamp)
    ).to.be.revertedWith("Proof already exists for this record ID");
  });

  it("Should correctly verify matching hash and detect mismatch", async function () {
    const recordId = 103;
    const originalHash = ethers.keccak256(ethers.toUtf8Bytes("original-data"));
    const tamperedHash = ethers.keccak256(ethers.toUtf8Bytes("tampered-data"));
    const deviceId = "ENV_SENSOR_001";
    const timestamp = Math.floor(Date.now() / 1000);

    await iotProvenance.recordDataProof(recordId, originalHash, deviceId, timestamp);

    const [isValidMatch] = await iotProvenance.verifyData(recordId, originalHash);
    expect(isValidMatch).to.be.true;

    const [isValidMismatch] = await iotProvenance.verifyData(recordId, tamperedHash);
    expect(isValidMismatch).to.be.false;
  });

  it("Should return total count of recorded proofs", async function () {
    expect(await iotProvenance.getProofCount()).to.equal(0);

    const dataHash1 = ethers.keccak256(ethers.toUtf8Bytes("data-1"));
    const dataHash2 = ethers.keccak256(ethers.toUtf8Bytes("data-2"));

    await iotProvenance.recordDataProof(1, dataHash1, "ENV_SENSOR_001", Math.floor(Date.now() / 1000));
    await iotProvenance.recordDataProof(2, dataHash2, "ENV_SENSOR_002", Math.floor(Date.now() / 1000));

    expect(await iotProvenance.getProofCount()).to.equal(2);
  });
});
