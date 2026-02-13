require('dotenv').config({ path: '../.env' });

module.exports = {
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-fallback-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Password hashing
  bcryptRounds: 10,

  // Session configuration
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',

  // Token validation
  validateToken: (token) => {
    if (!token) {
      throw new Error('No token provided');
    }
    return token.replace('Bearer ', '');
  }
};
