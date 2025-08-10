const app = require('./app');
const config = require('./config/config');

/**
 * Server startup file for Unifeed v1 Backend
 */

const PORT = config.port;

// Start the server
const server = app.listen(PORT, () => {
  console.log('🚀 Unifeed Backend v1 Server Started');
  console.log('=====================================');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Base URL: ${config.appBaseUrl}`);
  console.log('=====================================');
  console.log('📋 Available Endpoints:');
  console.log(`   Health Check: ${config.appBaseUrl}/`);
  console.log(`   OAuth Start:  ${config.appBaseUrl}/auth/typeform`);
  console.log(`   OAuth Callback: ${config.appBaseUrl}/auth/typeform/callback`);
  console.log(`   Auth Status:  ${config.appBaseUrl}/auth/status?userId=xxx`);
  console.log(`   Get Forms:    ${config.appBaseUrl}/typeform/forms?userId=xxx`);
  console.log(`   Get Responses: ${config.appBaseUrl}/typeform/responses/{formId}?userId=xxx`);
  console.log('=====================================');
  console.log('💡 Next Steps:');
  console.log('   1. Update .env with your Typeform OAuth credentials');
  console.log('   2. Visit /auth/typeform to start OAuth flow');
  console.log('   3. Use returned userId to fetch forms and responses');
  console.log('=====================================');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('   Try using a different port in your .env file');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;