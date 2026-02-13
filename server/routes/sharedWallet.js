/**
 * Shared Wallet Routes (Direct Path Compatibility)
 *
 * These routes match the exact paths that the Shared Wallet UI expects.
 * They simply proxy to our mock Wallet BFF controller.
 *
 * Wallet UI expects: /api/SharedWallet/*
 * These routes provide exactly that.
 */

const express = require('express');
const router = express.Router();
const mockWalletBffController = require('../controllers/mockWalletBffController');
const { authenticate } = require('../middleware/auth');

// All SharedWallet endpoints require authentication
router.get('/wallet', authenticate, mockWalletBffController.getWallet);
router.post('/card', authenticate, mockWalletBffController.addCard);
router.post('/bankaccount', authenticate, mockWalletBffController.addBankAccount);
router.post('/ValidateMFA', authenticate, mockWalletBffController.validateMFA);
router.get('/MfaStatus', authenticate, mockWalletBffController.getMfaStatus);

module.exports = router;
