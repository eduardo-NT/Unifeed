/**
 * Shared Controllers Index
 * Entry point for shared controllers used across multiple integrations
 */

const feedbackController = require('./feedbackController');
const userController = require('./userController');
const integrationController = require('./integrationController');

module.exports = {
  feedbackController,
  userController,
  integrationController
};
