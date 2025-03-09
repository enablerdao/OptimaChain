const express = require('express');
const path = require('path');
const app = express();
const PORT = 50898;

// Static files
app.use(express.static(path.join(__dirname, '/')));

// CORS settings
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OptimaChain server running at http://localhost:${PORT}`);
});