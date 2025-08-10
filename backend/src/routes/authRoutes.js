const express = require('express');
const authController = require('../controllers/typeform/authController');

const router = express.Router();

/**
 * Authentication Routes
 * Handles OAuth flow with Typeform
 */

// Initiate OAuth flow
// GET /auth/typeform
router.get('/typeform', authController.initiateOAuth);

// Handle OAuth callback
// GET /auth/typeform/callback
router.get('/typeform/callback', authController.handleCallback);

// Get authentication status
// GET /auth/status?userId=xxx
router.get('/status', authController.getAuthStatus);

// Logout user
// POST /auth/logout
router.post('/logout', authController.logout);

// Debug: Get memory store stats
// GET /auth/debug/stats
router.get('/debug/stats', authController.getDebugStats);

module.exports = router;