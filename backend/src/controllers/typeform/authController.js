const { v4: uuidv4 } = require('uuid');
const supabaseClient = require('../../config/supabaseClient');
const typeformService = require('../../services/typeform/typeformService');
const userService = require('../../services/userService');
const memoryStore = require('../../utils/memoryStore');

/**
 * Authentication Controller
 * Handles OAuth flow with Typeform
 */

class AuthController {
  
  /**
   * Initiate OAuth flow
   * GET /auth/typeform
   */
  async initiateOAuth(req, res) {
    try {
      console.log('🚀 Initiating OAuth flow...');
      
      // Generate a unique state for CSRF protection
      const state = uuidv4();
      
      // Store state in memory for validation
      memoryStore.storeOAuthState(state);
      
      // Generate OAuth URL
      const authUrl = typeformService.generateAuthUrl(state);
      
      console.log('✅ Redirecting to Typeform OAuth...');
      
      // Redirect user to Typeform OAuth page
      res.redirect(authUrl);
      
    } catch (error) {
      console.error('❌ OAuth initiation failed:', error.message);
      res.status(500).json({
        error: 'OAuth initiation failed',
        message: error.message
      });
    }
  }

  /**
   * Handle OAuth callback
   * GET /auth/typeform/callback
   */
  async handleCallback(req, res) {
    try {
      const { code, state, error } = req.query;

      console.log('🔄 Processing OAuth callback...');

      // Check for OAuth errors
      if (error) {
        console.error('❌ OAuth error:', error);
        return res.status(400).json({
          error: 'OAuth authorization failed',
          details: error
        });
      }

      // Validate required parameters
      if (!code || !state) {
        console.error('❌ Missing required OAuth parameters');
        return res.status(400).json({
          error: 'Invalid callback',
          message: 'Missing authorization code or state parameter'
        });
      }

      // Validate state (CSRF protection)
      if (!memoryStore.validateOAuthState(state)) {
        console.error('❌ Invalid OAuth state');
        return res.status(400).json({
          error: 'Invalid state parameter',
          message: 'Possible CSRF attack detected'
        });
      }

      // Exchange code for token
      console.log('🔄 Exchanging authorization code for token...');
      const tokenData = await typeformService.exchangeCodeForToken(code);

      // Get user information
      console.log('👤 Fetching user information...');
      const userInfo = await typeformService.getUserInfo(tokenData.access_token);
      
      // Generate user ID (use Typeform user ID)
      const userId = userInfo.user_id;

      // Store token and user info in memory
      memoryStore.storeToken(userId, tokenData);
      memoryStore.storeUser(userId, userInfo);

      console.log(`✅ OAuth flow completed successfully for user: ${userId}`);

      // Return success response with user info (excluding sensitive token data)
      res.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: userInfo.user_id,
          email: userInfo.email,
          name: userInfo.name,
          language: userInfo.language,
          alias: userInfo.alias
        },
        tokenInfo: {
          expiresIn: tokenData.expires_in,
          scope: tokenData.scope,
          tokenType: tokenData.token_type
        },
        nextSteps: {
          message: 'You can now fetch your form responses',
          endpoint: '/typeform/responses/{formId}'
        }
      });

    } catch (error) {
      console.error('❌ OAuth callback failed:', error.message);
      res.status(500).json({
        error: 'Authentication failed',
        message: error.message
      });
    }
  }

  /**
   * Get authentication status
   * GET /auth/status
   */
  async getAuthStatus(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          error: 'Missing user ID',
          message: 'Please provide userId query parameter'
        });
      }

      const tokenData = memoryStore.getToken(userId);
      const userData = memoryStore.getUser(userId);

      if (!tokenData || !userData) {
        return res.json({
          authenticated: false,
          message: 'No valid authentication found for this user'
        });
      }

      res.json({
        authenticated: true,
        user: {
          id: userData.user_id,
          email: userData.email,
          name: userData.name,
          alias: userData.alias
        },
        tokenInfo: {
          expiresAt: tokenData.expiresAt,
          scope: tokenData.scope,
          isExpired: new Date() > new Date(tokenData.expiresAt)
        }
      });

    } catch (error) {
      console.error('❌ Auth status check failed:', error.message);
      res.status(500).json({
        error: 'Status check failed',
        message: error.message
      });
    }
  }

  /**
   * Logout user (clear stored tokens)
   * POST /auth/logout
   */
  async logout(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'Missing user ID',
          message: 'Please provide userId in request body'
        });
      }

      // Remove token and user data
      const tokenRemoved = memoryStore.removeToken(userId);
      
      if (!tokenRemoved) {
        return res.json({
          success: false,
          message: 'No active session found for this user'
        });
      }

      console.log(`✅ User logged out successfully: ${userId}`);
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('❌ Logout failed:', error.message);
      res.status(500).json({
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * Get memory store stats (for debugging)
   * GET /auth/debug/stats
   */
  async getDebugStats(req, res) {
    try {
      const stats = memoryStore.getStats();
      const activeTokens = memoryStore.getAllTokens();

      res.json({
        memoryStore: stats,
        activeUsers: activeTokens,
        serverUptime: process.uptime(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Debug stats failed:', error.message);
      res.status(500).json({
        error: 'Debug stats failed',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();