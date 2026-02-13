const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authConfig = require('../config/auth');

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    authConfig.jwtSecret,
    {
      expiresIn: authConfig.jwtExpiresIn
    }
  );
};

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      role = 'tenant' // Default to tenant role
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        details: 'A user with this email address already exists'
      });
    }

    // Only admins can create other admins or property managers
    // For now, we'll allow any role (later, add authentication check)
    const allowedRoles = ['tenant', 'admin', 'property_manager'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
        details: `Role must be one of: ${allowedRoles.join(', ')}`
      });
    }

    // Create new user (password will be hashed by User model hook)
    const user = await User.create({
      email,
      password_hash: password, // Will be hashed automatically
      first_name: firstName,
      last_name: lastName,
      phone,
      date_of_birth: dateOfBirth,
      role,
      status: 'active'
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (without password) and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.toSafeJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: `Account is ${user.status}`,
        details: 'Please contact support for assistance'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Update last login timestamp
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      success: true,
      message: 'Login successful',
      user: user.toSafeJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    // User is already attached by authenticate middleware
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency and future enhancements (e.g., token blacklist)
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Refresh JWT token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    // User is already authenticated by middleware
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshToken
};
