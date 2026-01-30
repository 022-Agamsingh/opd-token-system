const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const doctorRoutes = require('./routes/doctorRoutes');
const slotRoutes = require('./routes/slotRoutes');
const tokenRoutes = require('./routes/tokenRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'OPD Token Allocation Engine',
  });
});

// API Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/tokens', tokenRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OPD Token Allocation Engine API',
    version: '1.0.0',
    endpoints: {
      doctors: '/api/doctors',
      slots: '/api/slots',
      tokens: '/api/tokens',
      health: '/health',
    },
    documentation: 'See README.md for API documentation',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   OPD Token Allocation Engine                         ║
║   Server running on port ${PORT}                         ║
║   Environment: ${config.nodeEnv}                      ║
║   Time: ${new Date().toLocaleString()}                ║
╚═══════════════════════════════════════════════════════╝
  `);
  console.log('API Endpoints:');
  console.log(`  - GET  /health`);
  console.log(`  - GET  /api/doctors`);
  console.log(`  - POST /api/doctors`);
  console.log(`  - GET  /api/slots`);
  console.log(`  - POST /api/slots`);
  console.log(`  - POST /api/tokens/book`);
  console.log(`  - POST /api/tokens/walkin`);
  console.log(`  - POST /api/tokens/priority`);
  console.log(`  - POST /api/tokens/emergency`);
  console.log(`\nReady to accept requests!\n`);
});

module.exports = app;
