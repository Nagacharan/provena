// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IoTDataProvenance
 * @dev Smart contract for anchoring off-chain IoT data cryptographic proofs (SHA-256 hashes)
 * to provide tamper-evident data provenance.
 */
contract IoTDataProvenance {

    struct Proof {
        uint256 recordId;
        bytes32 dataHash;
        string deviceId;
        uint256 timestamp;
        uint256 blockTimestamp;
        address recordedBy;
        bool exists;
    }

    // Mapping from off-chain Record ID to Proof
    mapping(uint256 => Proof) private _proofs;
    
    // Array of recorded record IDs for enumeration
    uint256[] private _recordIds;

    // Registered devices catalog
    mapping(string => bool) private _registeredDevices;

    // Events
    event DeviceRegistered(string indexed deviceId, uint256 registeredAt);
    event DataProofRecorded(
        uint256 indexed recordId,
        bytes32 indexed dataHash,
        string deviceId,
        uint256 timestamp,
        uint256 blockTimestamp
    );

    /**
     * @dev Registers a new device identifier on-chain.
     */
    function registerDevice(string memory deviceId) external {
        require(bytes(deviceId).length > 0, "Device ID cannot be empty");
        if (!_registeredDevices[deviceId]) {
            _registeredDevices[deviceId] = true;
            emit DeviceRegistered(deviceId, block.timestamp);
        }
    }

    /**
     * @dev Check if a device ID is registered.
     */
    function isDeviceRegistered(string memory deviceId) external view returns (bool) {
        return _registeredDevices[deviceId];
    }

    /**
     * @dev Records a cryptographic data proof (SHA-256 hash) for a given IoT record ID.
     */
    function recordDataProof(
        uint256 recordId,
        bytes32 dataHash,
        string memory deviceId,
        uint256 timestamp
    ) external {
        require(recordId > 0, "Record ID must be greater than zero");
        require(dataHash != bytes32(0), "Data hash cannot be empty");
        require(bytes(deviceId).length > 0, "Device ID cannot be empty");
        require(!_proofs[recordId].exists, "Proof already exists for this record ID");

        _proofs[recordId] = Proof({
            recordId: recordId,
            dataHash: dataHash,
            deviceId: deviceId,
            timestamp: timestamp,
            blockTimestamp: block.timestamp,
            recordedBy: msg.sender,
            exists: true
        });

        _recordIds.push(recordId);

        if (!_registeredDevices[deviceId]) {
            _registeredDevices[deviceId] = true;
            emit DeviceRegistered(deviceId, block.timestamp);
        }

        emit DataProofRecorded(
            recordId,
            dataHash,
            deviceId,
            timestamp,
            block.timestamp
        );
    }

    /**
     * @dev Fetches recorded data proof details for a record ID.
     */
    function getDataProof(uint256 recordId) external view returns (
        uint256 id,
        bytes32 dataHash,
        string memory deviceId,
        uint256 timestamp,
        uint256 blockTimestamp,
        address recordedBy,
        bool exists
    ) {
        Proof memory p = _proofs[recordId];
        return (
            p.recordId,
            p.dataHash,
            p.deviceId,
            p.timestamp,
            p.blockTimestamp,
            p.recordedBy,
            p.exists
        );
    }

    /**
     * @dev Verifies if a given hash matches the on-chain stored proof.
     */
    function verifyData(uint256 recordId, bytes32 expectedHash) external view returns (bool isValid, bytes32 actualHash) {
        Proof memory p = _proofs[recordId];
        if (!p.exists) {
            return (false, bytes32(0));
        }
        return (p.dataHash == expectedHash, p.dataHash);
    }

    /**
     * @dev Returns total number of proofs anchored on-chain.
     */
    function getProofCount() external view returns (uint256) {
        return _recordIds.length;
    }
}
