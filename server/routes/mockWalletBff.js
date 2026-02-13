/**
 * Mock Shared Wallet BFF Routes
 *
 * These routes simulate the Shared Wallet BFF API for local development.
 * All routes are prefixed with /api/wallet-bff
 */

const express = require('express');
const router = express.Router();
const mockWalletBffController = require('../controllers/mockWalletBffController');
const { authenticate } = require('../middleware/auth');

/**
 * User Scoped Token Endpoint
 * This endpoint doesn't require authentication (it's used to get the user scoped token)
 * but it does require an operations token in the Authorization header
 */
router.post(
  '/UserScoped/acquire_user_scoped_token',
  mockWalletBffController.acquireUserScopedToken
);

/**
 * All SharedWallet endpoints require authentication
 * The authenticate will validate the JWT token and attach user info to req.user
 */

// Get wallet (list all payment instruments)
router.get(
  '/SharedWallet/wallet',
  authenticate,
  mockWalletBffController.getWallet
);

// Add credit card
router.post(
  '/SharedWallet/card',
  authenticate,
  mockWalletBffController.addCard
);

// Add bank account
router.post(
  '/SharedWallet/bankaccount',
  authenticate,
  mockWalletBffController.addBankAccount
);

// MFA validation
router.post(
  '/SharedWallet/ValidateMFA',
  authenticate,
  mockWalletBffController.validateMFA
);

// Get MFA status
router.get(
  '/SharedWallet/MfaStatus',
  authenticate,
  mockWalletBffController.getMfaStatus
);

module.exports = router;
