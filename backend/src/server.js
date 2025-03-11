const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const seedData = require('./config/seedData');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const marketRoutes = require('./routes/marketRoutes');
const validatorRoutes = require('./routes/validatorRoutes');

// Import validator network
const { network } = require('../../core/validator');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/validators', validatorRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to OptimaChain API',
    version: '0.1.0',
    status: 'development'
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // 初期データを送信
  socket.emit('network:metrics', network.getNetworkMetrics());
  socket.emit('validators:list', network.getValidators(true));
  
  // バリデータネットワークのイベントをリッスン
  network.on('metrics', (metrics) => {
    socket.emit('network:metrics', metrics);
  });
  
  network.on('block', (blockData) => {
    socket.emit('network:block', blockData);
  });
  
  network.on('validator:metrics', (validatorMetrics) => {
    socket.emit('validator:metrics', validatorMetrics);
  });
  
  // クライアント切断時
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Set port and start server
const PORT = process.env.PORT || 3000;

// Connect to database before starting server
connectDB().then(() => {
  // Seed data if in development mode
  if (process.env.NODE_ENV === 'development') {
    seedData();
  }
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    
    // バリデータネットワークの初期化（まだ初期化されていない場合）
    if (!network.validators.length) {
      network.initialize();
      console.log('Validator network initialized');
    }
  });

});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
