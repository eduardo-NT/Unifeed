/**
 * Simple in-memory storage for v1 backend
 * Stores OAuth tokens and user sessions
 * Note: Data is lost on server restart - acceptable for v1
 */

class MemoryStore {
  constructor() {
    // Store for OAuth tokens: { userId: tokenData }
    this.tokens = new Map();
    
    // Store for OAuth states (CSRF protection): { state: timestamp }
    this.oauthStates = new Map();
    
    // Store for user info: { userId: userInfo }
    this.users = new Map();
    
    console.log('🗄️  Memory store initialized');
  }

  // OAuth Token Management
  storeToken(userId, tokenData) {
    this.tokens.set(userId, {
      ...tokenData,
      storedAt: new Date(),
      expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
    });
    console.log(`🔑 Token stored for user: ${userId}`);
  }

  getToken(userId) {
    const tokenData = this.tokens.get(userId);
    if (!tokenData) {
      return null;
    }

    // Check if token is expired
    if (tokenData.expiresAt && new Date() > tokenData.expiresAt) {
      console.log(`⚠️  Token expired for user: ${userId}`);
      this.tokens.delete(userId);
      return null;
    }

    return tokenData;
  }

  removeToken(userId) {
    const removed = this.tokens.delete(userId);
    if (removed) {
      console.log(`🗑️  Token removed for user: ${userId}`);
    }
    return removed;
  }

  // OAuth State Management (CSRF protection)
  storeOAuthState(state) {
    this.oauthStates.set(state, {
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
  }

  validateOAuthState(state) {
    const stateData = this.oauthStates.get(state);
    if (!stateData) {
      return false;
    }

    // Check if state is expired
    if (new Date() > stateData.expiresAt) {
      this.oauthStates.delete(state);
      return false;
    }

    // Remove state after validation (one-time use)
    this.oauthStates.delete(state);
    return true;
  }

  // User Information Management
  storeUser(userId, userInfo) {
    this.users.set(userId, {
      ...userInfo,
      storedAt: new Date()
    });
    console.log(`👤 User info stored: ${userId}`);
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  // Cleanup expired entries (optional utility)
  cleanup() {
    const now = new Date();
    
    // Clean expired OAuth states
    for (const [state, data] of this.oauthStates) {
      if (now > data.expiresAt) {
        this.oauthStates.delete(state);
      }
    }
    
    console.log('🧹 Memory store cleanup completed');
  }

  // Debug/Stats methods
  getStats() {
    return {
      tokens: this.tokens.size,
      oauthStates: this.oauthStates.size,
      users: this.users.size
    };
  }

  getAllTokens() {
    // For debugging - don't expose sensitive data in production
    return Array.from(this.tokens.keys());
  }
}

// Export singleton instance
module.exports = new MemoryStore();