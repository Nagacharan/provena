require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const blockchainService = require('./blockchain/blockchainService');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration for Cloudflare Pages frontend & local development
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Provena - IoT Data Provenance & Verification API',
    version: '1.0.0',
    status: 'ONLINE',
    health: '/api/health',
    documentation: '/api/system/status'
  });
});

// Boot Server
async function startServer() {
  // Initialize Blockchain connection
  await blockchainService.init();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Provena Backend Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start backend server:', err);
});
