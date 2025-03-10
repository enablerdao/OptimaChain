const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 50898;

// Import backend routes
const userRoutes = require('./backend/src/routes/userRoutes');
const walletRoutes = require('./backend/src/routes/walletRoutes');
const transactionRoutes = require('./backend/src/routes/transactionRoutes');
const tokenRoutes = require('./backend/src/routes/tokenRoutes');
const marketRoutes = require('./backend/src/routes/marketRoutes');

// Static files
app.use(express.static(path.join(__dirname, 'optimachain-ui')));

// Middleware
app.use(cors());
app.use(express.json());

// CORS settings
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/market', marketRoutes);

// Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'optimachain-ui/index.html'));
});

app.get('/wallet', (req, res) => {
  res.sendFile(path.join(__dirname, 'optimachain-ui/wallet/index.html'));
});

app.get('/dex', (req, res) => {
  res.sendFile(path.join(__dirname, 'optimachain-ui/dex/index.html'));
});

// API root route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to OptimaChain API',
    version: '0.1.0',
    status: 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OptimaChain server running at http://localhost:${PORT}`);
});
