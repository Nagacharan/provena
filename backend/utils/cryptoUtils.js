const crypto = require('crypto');

/**
 * Creates a deterministic, canonical string representation of an IoT sensor record.
 * Ensures consistent key order and numerical formatting so identical logical data always
 * produces the exact same string before hashing.
 * 
 * @param {Object} data 
 * @returns {string} Canonicalized JSON string
 */
function canonicalizeSensorData(data) {
  const normalized = {
    device_id: String(data.device_id).trim(),
    humidity: Number(Number(data.humidity).toFixed(2)),
    sequence: Number(data.sequence),
    temperature: Number(Number(data.temperature).toFixed(2)),
    timestamp: String(data.timestamp).trim()
  };

  // Sort keys alphabetically explicitly
  const sortedKeys = Object.keys(normalized).sort();
  const sortedObj = {};
  for (const key of sortedKeys) {
    sortedObj[key] = normalized[key];
  }

  return JSON.stringify(sortedObj);
}

/**
 * Generates a SHA-256 cryptographic hash of the canonical sensor data representation.
 * Returns a 0x-prefixed hex string compatible with Solidity `bytes32`.
 * 
 * @param {Object} data 
 * @returns {string} 0x-prefixed 64-character hex hash string (66 chars total with 0x)
 */
function generateSHA256Hash(data) {
  const canonicalStr = canonicalizeSensorData(data);
  const hashHex = crypto.createHash('sha256').update(canonicalStr, 'utf8').digest('hex');
  return '0x' + hashHex;
}

module.exports = {
  canonicalizeSensorData,
  generateSHA256Hash
};
