const axios = require('axios');
const config = require('../../config/config');

/**
 * Typeform API Service
 * Handles direct API calls to Typeform for OAuth and data fetching
 */

class TypeformService {
  constructor() {
    this.baseURL = config.typeform.apiBaseUrl;
    this.oauthURL = config.typeform.oauthUrl;
    
    // Validate configuration on initialization
    this.validateConfiguration();
  }

  /**
   * Validate Typeform configuration
   */
  validateConfiguration() {
    const requiredConfig = {
      'Client ID': config.typeform.clientId,
      'Client Secret': config.typeform.clientSecret,
      'Redirect URI': config.typeform.redirectUri,
      'OAuth URL': this.oauthURL,
      'API Base URL': this.baseURL
    };

    console.log('🔍 Validating Typeform configuration...');
    
    let hasErrors = false;
    Object.entries(requiredConfig).forEach(([key, value]) => {
      if (!value) {
        console.error(`❌ Missing ${key}`);
        hasErrors = true;
      } else {
        console.log(`✅ ${key}: ${key.includes('Secret') ? '[PRESENT]' : value}`);
      }
    });

    if (hasErrors) {
      throw new Error('Invalid Typeform configuration. Please check your environment variables.');
    }
    
    console.log('✅ Typeform configuration validation passed');
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: config.typeform.clientId,
      redirect_uri: config.typeform.redirectUri,
      scope: config.typeform.scopes.join(' '),
      response_type: 'code',
      state: state
    });

    const authUrl = `${this.oauthURL}/authorize?${params.toString()}`;
    console.log('🔗 Generated OAuth URL');
    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code) {
    try {
      console.log('🔄 Exchanging code for token...');
      
      // Debug: Log configuration (without exposing secrets)
      console.log('🔍 Debug - OAuth Configuration:');
      console.log(`- Client ID: ${config.typeform.clientId?.substring(0, 8)}...`);
      console.log(`- Client Secret: ${config.typeform.clientSecret ? '[PRESENT]' : '[MISSING]'}`);
      console.log(`- Redirect URI: ${config.typeform.redirectUri}`);
      console.log(`- OAuth URL: ${this.oauthURL}`);
      console.log(`- Authorization Code: ${code?.substring(0, 10)}...`);
      
      // Typeform expects form-encoded data, not JSON
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: config.typeform.clientId,
        client_secret: config.typeform.clientSecret,
        redirect_uri: config.typeform.redirectUri
      });
      
      console.log('🔍 Debug - Request data length:', params.toString().length);
      
      const response = await axios.post(`${this.oauthURL}/token`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('✅ Token exchange successful');
      return response.data;
    } catch (error) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      console.error('🔍 Debug - Full error response:', JSON.stringify(error.response?.data, null, 2));
      throw new Error(`Token exchange failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken) {
    try {
      console.log('👤 Fetching user info...');
      
      const response = await axios.get(`${this.baseURL}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ User info fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user info:', error.response?.data || error.message);
      throw new Error(`Failed to fetch user info: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get list of user's forms
   */
  async getUserForms(accessToken, page = 1, pageSize = 200) {
    try {
      console.log(`📋 Fetching user forms (page ${page})...`);
      
      const response = await axios.get(`${this.baseURL}/forms`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: page,
          page_size: pageSize
        }
      });

      console.log(`✅ Fetched ${response.data.items?.length || 0} forms`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch forms:', error.response?.data || error.message);
      throw new Error(`Failed to fetch forms: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get form responses
   */
  async getFormResponses(accessToken, formId, options = {}) {
    try {
      console.log(`📊 Fetching responses for form: ${formId}`);
      
      const params = {
        page_size: options.pageSize || 1000,
        since: options.since || null,
        until: options.until || null,
        after: options.after || null,
        before: options.before || null,
        included_response_ids: options.includedResponseIds || null,
        completed: options.completed !== undefined ? options.completed : null,
        sort: options.sort || null,
        query: options.query || null,
        fields: options.fields || null
      };

      // Remove null values
      Object.keys(params).forEach(key => {
        if (params[key] === null) {
          delete params[key];
        }
      });

      const response = await axios.get(`${this.baseURL}/forms/${formId}/responses`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: params
      });

      console.log(`✅ Fetched ${response.data.items?.length || 0} responses for form ${formId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch responses for form ${formId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch responses: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get specific form details
   */
  async getForm(accessToken, formId) {
    try {
      console.log(`📋 Fetching form details: ${formId}`);
      
      const response = await axios.get(`${this.baseURL}/forms/${formId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Fetched form details: ${formId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch form ${formId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch form: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    try {
      console.log('🔄 Refreshing access token...');
      
      // Typeform expects form-encoded data, not JSON
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.typeform.clientId,
        client_secret: config.typeform.clientSecret
      });
      
      const response = await axios.post(`${this.oauthURL}/token`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('✅ Token refresh successful');
      return response.data;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      throw new Error(`Token refresh failed: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = new TypeformService();
