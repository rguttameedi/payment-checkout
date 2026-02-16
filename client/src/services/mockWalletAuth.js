/**
 * Mock Wallet Authentication Service
 *
 * This service generates mock tokens for local development and learning.
 * In production, these would come from Unified Login IDP and the real BFF.
 */

import { getIntegrationConfig } from '../config/integrationConfig';

/**
 * Generate a mock JWT token
 * @param {string} scope - Token scope
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} Mock JWT token
 */
function generateMockJWT(scope, expiresIn = 3600) {
  // Simplified mock JWT to reduce header size (avoid 431 error)
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: localStorage.getItem('userId') || '1',
    scope: scope,
    exp: now + expiresIn
  };

  // Short mock token to avoid large headers
  const encodedPayload = btoa(JSON.stringify(payload));
  return `mock.${encodedPayload}.sig`;
}

/**
 * Generate a mock encrypted user scoped token
 * @returns {string} Mock encrypted token
 */
function generateMockUserScopedToken() {
  const userId = localStorage.getItem('userId') || '1';

  // Simplified token to reduce header size
  const tokenData = {
    uid: userId,
    ts: Date.now()
  };

  // Short encrypted token
  return btoa(JSON.stringify(tokenData));
}

/**
 * Mock Authentication Service
 */
export const mockWalletAuth = {
  /**
   * Get operations token
   * Uses the real user's JWT token from localStorage
   */
  async getOperationsToken() {
    // Get the real JWT token from localStorage (set during login)
    const token = localStorage.getItem('token');

    if (token) {
      console.log('🔐 Using real user JWT token as operations token:', {
        token: token.substring(0, 50) + '...'
      });
      return token;
    }

    // Fallback to mock if no real token
    console.warn('⚠️ No real token found, using mock');
    const mockToken = generateMockJWT('urn:upp-wallet-operations', 7200);
    return mockToken;
  },

  /**
   * Get mock wallet token
   * Simulates getting wallet-scoped JWT
   */
  async getWalletToken() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const token = generateMockJWT('urn:upp-wallet', 3600);

    console.log('🔐 Mock Wallet Token generated:', {
      scope: 'urn:upp-wallet',
      expiresIn: '1 hour',
      token: token.substring(0, 50) + '...'
    });

    return token;
  },

  /**
   * Acquire user scoped access token
   * Calls real BFF's /api/UserScoped/acquire_user_scoped_token endpoint
   *
   * @param {string} operationsToken - Operations JWT token
   * @param {string} walletToken - Wallet JWT token
   * @returns {Promise<Object>} User scoped token response
   */
  async acquireUserScopedToken(operationsToken, walletToken) {
    const userId = localStorage.getItem('userId') || '1';

    try {
      console.log('📡 Calling REAL BFF: POST /api/UserScoped/acquire_user_scoped_token');

      // Get integration configuration
      const integrationConfig = getIntegrationConfig();

      const response = await fetch('/api/UserScoped/acquire_user_scoped_token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${operationsToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          realpage_id: userId,
          upp_wallet_token: walletToken,
          // Pass integration model configuration
          ...integrationConfig
        })
      });

      if (!response.ok) {
        throw new Error(`BFF returned ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ Real User Scoped Token acquired from BFF:', {
        expiresAt: data.expiresAt,
        token: data.user_scoped_access_token?.substring(0, 50) + '...'
      });

      return data;
    } catch (error) {
      console.warn('⚠️ Real BFF call failed, falling back to mock:', error.message);

      // Fallback to mock if real API fails
      const userScopedToken = generateMockUserScopedToken();
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

      return {
        user_scoped_access_token: userScopedToken,
        expiresAt: expiresAt,
        expires_in: 3600
      };
    }
  },

  /**
   * Initialize wallet authentication
   * Gets all necessary tokens for wallet integration
   *
   * @returns {Promise<Object>} All tokens needed for wallet
   */
  async initializeWallet() {
    try {
      console.log('🚀 Initializing Wallet Authentication (MOCK MODE)...');

      // Step 1: Get operations token
      const operationsToken = await this.getOperationsToken();

      // Step 2: Get wallet token
      const walletToken = await this.getWalletToken();

      // Step 3: Acquire user scoped token from BFF
      const userScopedResponse = await this.acquireUserScopedToken(operationsToken, walletToken);

      console.log('✅ Wallet Authentication initialized successfully!');

      return {
        operationsToken,
        walletToken,
        userScopedAccessToken: userScopedResponse.user_scoped_access_token,
        expiresAt: userScopedResponse.expiresAt,
        expiresIn: userScopedResponse.expires_in
      };
    } catch (error) {
      console.error('❌ Failed to initialize wallet authentication:', error);
      throw error;
    }
  },

  /**
   * Check if tokens are still valid
   * @param {string} expiresAt - ISO timestamp when tokens expire
   * @returns {boolean} True if tokens are still valid
   */
  isTokenValid(expiresAt) {
    if (!expiresAt) return false;
    return new Date(expiresAt) > new Date();
  },

  /**
   * Store tokens in session storage
   * @param {Object} tokens - Tokens object
   */
  storeTokens(tokens) {
    sessionStorage.setItem('wallet_tokens', JSON.stringify(tokens));
    console.log('💾 Wallet tokens stored in session storage');
  },

  /**
   * Get stored tokens from session storage
   * @returns {Object|null} Stored tokens or null
   */
  getStoredTokens() {
    const stored = sessionStorage.getItem('wallet_tokens');
    if (!stored) return null;

    try {
      const tokens = JSON.parse(stored);

      // Check if tokens are still valid
      if (this.isTokenValid(tokens.expiresAt)) {
        console.log('✅ Using cached wallet tokens');
        return tokens;
      } else {
        console.log('⏰ Cached tokens expired, need to refresh');
        this.clearTokens();
        return null;
      }
    } catch (error) {
      console.error('❌ Error parsing stored tokens:', error);
      return null;
    }
  },

  /**
   * Clear stored tokens
   */
  clearTokens() {
    sessionStorage.removeItem('wallet_tokens');
    console.log('🗑️ Wallet tokens cleared');
  },

  /**
   * Get or initialize wallet tokens
   * Uses cached tokens if available and valid, otherwise gets new ones
   *
   * @param {boolean} forceRefresh - Force refresh even if cached tokens exist
   * @returns {Promise<Object>} Wallet tokens
   */
  async getOrInitializeTokens(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getStoredTokens();
      if (cached) {
        return cached;
      }
    }

    const tokens = await this.initializeWallet();
    this.storeTokens(tokens);
    return tokens;
  }
};

export default mockWalletAuth;
