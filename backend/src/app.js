const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const memoryStore = require('./utils/memoryStore');

// Import routes
const authRoutes = require('./routes/authRoutes');
const typeformRoutes = require('./routes/typeformRoutes');

/**
 * Unifeed v1 Backend Application
 * OAuth-enabled Typeform data fetching and normalization
 */

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Unifeed Backend v1',
    status: 'running',
    version: '1.0.0',
    description: 'OAuth-enabled Typeform data fetching and normalization',
    endpoints: {
      auth: {
        initiate: 'GET /auth/typeform',
        callback: 'GET /auth/typeform/callback',
        status: 'GET /auth/status?userId=xxx',
        logout: 'POST /auth/logout'
      },
      typeform: {
        responses: 'GET /typeform/responses/:formId?userId=xxx',
        forms: 'GET /typeform/forms?userId=xxx',
        formDetails: 'GET /typeform/forms/:formId?userId=xxx',
        testNormalization: 'GET /typeform/test-normalization/:formId?userId=xxx'
      }
    },
    memoryStore: memoryStore.getStats(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/typeform', typeformRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: {
      auth: [
        'GET /auth/typeform',
        'GET /auth/typeform/callback',
        'GET /auth/status',
        'POST /auth/logout'
      ],
      typeform: [
        'GET /typeform/responses/:formId',
        'GET /typeform/forms',
        'GET /typeform/forms/:formId',
        'GET /typeform/test-normalization/:formId'
      ]
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  
  // Cleanup memory store
  memoryStore.cleanup();
  
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...');
  
  // Cleanup memory store
  memoryStore.cleanup();
  
  process.exit(0);
});

// Optional: Periodic cleanup of expired entries
setInterval(() => {
  memoryStore.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = app;