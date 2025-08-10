/**
 * Typeform Services Index
 * Main entry point for all Typeform-related services
 * 
 * This provides a clean interface for importing Typeform services
 * and maintains backward compatibility with existing imports
 */

const typeformService = require('./typeformService');
const typeformAuthService = require('./typeformAuthService');
const typeformClient = require('./typeformClient');

module.exports = {
  typeformService,
  typeformAuthService,
  typeformClient,
  
  // For backward compatibility, export the main service as default
  default: typeformService
};
