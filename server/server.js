require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import database and models
const { sequelize, testConnection } = require('./config/database');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenant');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const mockWalletBffRoutes = require('./routes/mockWalletBff');
const sharedWalletRoutes = require('./routes/sharedWallet');

// Import recurring payment processor
const recurringPaymentProcessor = require('./jobs/recurringPaymentProcessor');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Increase header size limit for wallet UI tokens
const http = require('http');
const server = http.createServer(app);
server.maxHeadersCount = 0; // No limit on header count
app.set('trust proxy', true);

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, please try again later'
});

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// REQUEST LOGGING (Development)
// ============================================

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rent Payment API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API ROUTES
// ============================================

// Auth routes (register, login, etc.)
app.use('/api/auth', authLimiter, authRoutes);

// Tenant routes (dashboard, payments, payment methods, auto-pay)
app.use('/api/tenant', tenantRoutes);

// Admin routes (properties, units, leases, tenants, payments)
app.use('/api/admin', adminRoutes);

// Payment processing routes
app.use('/api/payment', paymentRoutes);

// Mock Wallet BFF routes (for Shared Wallet UI integration)
app.use('/api/wallet-bff', mockWalletBffRoutes);

// Shared Wallet UI direct routes (matches what the wallet UI component expects)
app.use('/api/SharedWallet', sharedWalletRoutes);

// UserScoped token endpoint (wallet UI looks for this)
app.use('/api/UserScoped', mockWalletBffRoutes);

// ============================================
// ROOT ENDPOINT
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: 'Rent Payment Application API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tenant: '/api/tenant ✅',
      admin: '/api/admin ✅',
      payment: '/api/payment ✅',
      walletBff: '/api/wallet-bff (Mock Shared Wallet BFF) 🆕'
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start recurring payment processor
    if (process.env.ENABLE_RECURRING_PAYMENTS !== 'false') {
      recurringPaymentProcessor.start();
    }

    // Start Express server with increased header limits
    server.listen(PORT, () => {
      console.log('');
      console.log('════════════════════════════════════════════════');
      console.log('  🚀 Rent Payment API Server Started!');
      console.log('════════════════════════════════════════════════');
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
      console.log('  Press Ctrl+C to stop the server');
      console.log('════════════════════════════════════════════════');
      console.log('');
      console.log('✅ Available endpoints:');
      console.log('');
      console.log('   🔐 Authentication:');
      console.log('   POST   /api/auth/register           - Register new user');
      console.log('   POST   /api/auth/login              - Login user');
      console.log('   GET    /api/auth/me                 - Get current user');
      console.log('   POST   /api/auth/logout             - Logout user');
      console.log('   POST   /api/auth/refresh            - Refresh token');
      console.log('');
      console.log('   👤 Tenant Portal:');
      console.log('   GET    /api/tenant/dashboard        - Tenant dashboard');
      console.log('   GET    /api/tenant/payments         - Payment history');
      console.log('   GET    /api/tenant/payment-methods  - Saved payment methods');
      console.log('   POST   /api/tenant/payment-methods  - Add payment method');
      console.log('   GET    /api/tenant/recurring-schedule - Auto-pay settings');
      console.log('   POST   /api/tenant/recurring-schedule - Setup auto-pay');
      console.log('');
      console.log('   🏢 Admin Portal:');
      console.log('   GET    /api/admin/dashboard         - Admin dashboard');
      console.log('   GET    /api/admin/properties        - List properties');
      console.log('   POST   /api/admin/properties        - Create property');
      console.log('   GET    /api/admin/tenants           - List tenants');
      console.log('   GET    /api/admin/leases            - List leases');
      console.log('   POST   /api/admin/leases            - Create lease');
      console.log('   GET    /api/admin/payments          - View all payments');
      console.log('');
      console.log('   💳 Payment Processing:');
      console.log('   POST   /api/payment/process         - Process rent payment');
      console.log('   GET    /api/payment/:id             - Get payment status');
      console.log('   POST   /api/payment/:id/refund      - Refund payment (admin)');
      console.log('   POST   /api/payment/webhook         - Cybersource webhook');
      console.log('');
      console.log('   🔄 Mock Wallet BFF (Shared Wallet UI):');
      console.log('   POST   /api/wallet-bff/UserScoped/acquire_user_scoped_token');
      console.log('   GET    /api/wallet-bff/SharedWallet/wallet');
      console.log('   POST   /api/wallet-bff/SharedWallet/card');
      console.log('   POST   /api/wallet-bff/SharedWallet/bankaccount');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received. Closing server gracefully...');
  recurringPaymentProcessor.stop();
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT received. Closing server gracefully...');
  recurringPaymentProcessor.stop();
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app; // For testing
