const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate Shared Wallet UI requests
 * The wallet UI sends tokens in specific headers
 */
const authenticateWalletRequest = (req, res, next) => {
  try {
    console.log('🔐 [Wallet Auth] Authenticating wallet request...');
    console.log('🔐 [Wallet Auth] Headers:', {
      'operations-token': req.headers['operations-token'] ? 'present' : 'missing',
      'user-scoped-access-token': req.headers['user-scoped-access-token'] ? 'present' : 'missing',
      'authorization': req.headers['authorization'] ? 'present' : 'missing'
    });

    // Try to get token from various sources
    let token = null;

    // 1. Check for user-scoped-access-token header (Shared Wallet UI format)
    if (req.headers['user-scoped-access-token']) {
      token = req.headers['user-scoped-access-token'];
      console.log('🔐 [Wallet Auth] Using user-scoped-access-token');
    }
    // 2. Check for operations-token header
    else if (req.headers['operations-token']) {
      token = req.headers['operations-token'];
      console.log('🔐 [Wallet Auth] Using operations-token');
    }
    // 3. Check for standard Authorization header
    else if (req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('🔐 [Wallet Auth] Using Bearer token');
      }
    }

    if (!token) {
      console.log('❌ [Wallet Auth] No authentication token found');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authentication token provided'
        }
      });
    }

    // Verify the token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [Wallet Auth] Token verified for user:', decoded.userId);

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'tenant'
      };

      next();
    } catch (jwtError) {
      console.log('❌ [Wallet Auth] Invalid token:', jwtError.message);

      // If JWT verification fails, it might be a mock token from mockWalletAuth
      // In that case, try to extract user info from the token itself
      if (typeof token === 'string' && token.includes('mock_user_')) {
        // Mock token format: "mock_user_123"
        const userIdMatch = token.match(/mock_user_(\d+)/);
        if (userIdMatch) {
          const userId = parseInt(userIdMatch[1]);
          console.log('🔐 [Wallet Auth] Using mock token for user:', userId);
          req.user = {
            userId: userId,
            email: `user${userId}@test.com`,
            role: 'tenant'
          };
          return next();
        }
      }

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token'
        }
      });
    }

  } catch (error) {
    console.error('❌ [Wallet Auth] Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        details: error.message
      }
    });
  }
};

module.exports = { authenticateWalletRequest };
