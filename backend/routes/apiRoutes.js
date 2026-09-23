const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// System Health Endpoint for Render / Deployment Monitors
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'provena-backend',
    database: process.env.DATABASE_URL ? 'neon-postgresql' : 'local-json'
  });
});

// Detailed System Health & Stats
router.get('/system/status', sensorController.getSystemStatus);

// Device Registry
router.get('/devices', sensorController.getDevices);

// Sensor Simulation & Data Recording
router.post('/sensor-data/generate', sensorController.generateReading);
router.post('/sensor-data/record', sensorController.recordSensorData);
router.get('/sensor-data', sensorController.getAllSensorData);

// Provenance Details & Verification
router.get('/provenance/:id', sensorController.getProvenanceDetail);
router.post('/verify/:id', sensorController.verifyRecord);

// Controlled Tampering Sandbox Demo
router.post('/tamper/:id', sensorController.tamperRecord);

module.exports = router;
