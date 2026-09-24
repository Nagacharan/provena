require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/apiRoutes');
const blockchainService = require('./blockchain/blockchainService');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for flexibility
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Static Assets & Production Single-Page Application (SPA) Serving
const staticPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// Catch-all route for React SPA Client-Side Routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      name: 'Provena - IoT Data Provenance & Verification System',
      status: 'ONLINE',
      health: '/api/health',
      notice: 'Frontend static assets building or pending. Run `npm run build` to generate static bundle.'
    });
  }
});

// Boot Server
async function startServer() {
  // Initialize Blockchain connection
  await blockchainService.init();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Provena Unified Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start unified server:', err);
});
