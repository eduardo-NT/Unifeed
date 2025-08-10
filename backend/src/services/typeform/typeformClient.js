/**
 * Typeform Client
 * Low-level HTTP client for Typeform API interactions
 */

const axios = require('axios');
const config = require('../../config/config');

class TypeformClient {
  constructor() {
    this.baseURL = config.typeform.apiBaseUrl;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Received response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error.response?.status, error.response?.statusText);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make authenticated request to Typeform API
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise} - API response
   */
  async request(method, endpoint, options = {}) {
    const { accessToken, data, params } = options;

    const config = {
      method,
      url: endpoint,
      headers: {}
    };

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (data) {
      config.data = data;
    }

    if (params) {
      config.params = params;
    }

    try {
      const response = await this.client(config);
      return response.data;
    } catch (error) {
      console.error(`❌ API request failed:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post(endpoint, options = {}) {
    return this.request('POST', endpoint, options);
  }

  /**
   * PUT request
   */
  async put(endpoint, options = {}) {
    return this.request('PUT', endpoint, options);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }
}

module.exports = new TypeformClient();
