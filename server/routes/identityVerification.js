const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const IdentityVerificationService = require('../services/identityVerificationService');

/**
 * Check if identity verification is required for a payment amount
 * POST /api/identity-verification/check
 */
router.post('/check', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid payment amount'
      });
    }

    const result = await IdentityVerificationService.checkVerificationRequired(userId, amount);

    res.json(result);

  } catch (error) {
    console.error('❌ Error checking verification:', error);
    res.status(500).json({
      error: 'Failed to check verification requirements'
    });
  }
});

/**
 * Save identity verification data
 * POST /api/identity-verification/save
 */
router.post('/save', authenticate, async (req, res) => {
  try {
    const { ssn, govtId, govtIdType } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validate inputs
    if (!ssn || !govtId || !govtIdType) {
      return res.status(400).json({
        error: 'SSN, Government ID, and ID type are required'
      });
    }

    // Validate SSN format (XXX-XX-XXXX or XXXXXXXXX)
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    if (!ssnRegex.test(ssn)) {
      return res.status(400).json({
        error: 'Invalid SSN format. Use XXX-XX-XXXX or XXXXXXXXX'
      });
    }

    // Save encrypted data
    const result = await IdentityVerificationService.saveVerification(
      userId,
      ssn,
      govtId,
      govtIdType,
      ipAddress
    );

    res.json(result);

  } catch (error) {
    console.error('❌ Error saving verification:', error);
    res.status(500).json({
      error: 'Failed to save identity verification'
    });
  }
});

/**
 * Get verification status
 * GET /api/identity-verification/status
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await IdentityVerificationService.getVerificationStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    res.status(500).json({
      error: 'Failed to get verification status'
    });
  }
});

module.exports = router;
