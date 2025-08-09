require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('🔍 Environment variables check:');
console.log(`TYPEFORM_CLIENT_ID: ${process.env.TYPEFORM_CLIENT_ID ? 'LOADED' : 'MISSING'}`);
console.log(`TYPEFORM_CLIENT_SECRET: ${process.env.TYPEFORM_CLIENT_SECRET ? 'LOADED' : 'MISSING'}`);
console.log(`TYPEFORM_REDIRECT_URI: ${process.env.TYPEFORM_REDIRECT_URI || 'USING DEFAULT'}`);

const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // App Configuration
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  
  // Typeform OAuth Configuration
  typeform: {
    clientId: process.env.TYPEFORM_CLIENT_ID,
    clientSecret: process.env.TYPEFORM_CLIENT_SECRET,
    redirectUri: process.env.TYPEFORM_REDIRECT_URI || 'http://localhost:3000/auth/typeform/callback',
    
    // Typeform API URLs
    oauthUrl: process.env.TYPEFORM_OAUTH_URL || 'https://api.typeform.com/oauth',
    apiBaseUrl: process.env.TYPEFORM_API_BASE_URL || 'https://api.typeform.com',
    
    // OAuth Scopes
    scopes: ['accounts:read', 'forms:read', 'responses:read']
  }
};

// Validation for required environment variables
const requiredEnvVars = [
  'TYPEFORM_CLIENT_ID',
  'TYPEFORM_CLIENT_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

console.log('✅ Configuration loaded successfully');

module.exports = config;