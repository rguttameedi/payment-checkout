const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Payment Routes
 * All routes require authentication
 */

/**
 * @route   POST /api/payment/process
 * @desc    Process a one-time rent payment
 * @access  Tenant only
 */
router.post(
  '/process',
  authenticate,
  authorize('tenant'),
  paymentController.initiatePayment
);

/**
 * @route   GET /api/payment/:payment_id
 * @desc    Get payment status and details
 * @access  Tenant (own payments), Admin
 */
router.get(
  '/:payment_id',
  authenticate,
  authorize('tenant', 'admin', 'property_manager'),
  paymentController.getPaymentStatus
);

/**
 * @route   POST /api/payment/:payment_id/refund
 * @desc    Refund a payment
 * @access  Admin only
 */
router.post(
  '/:payment_id/refund',
  authenticate,
  authorize('admin'),
  paymentController.refundPayment
);

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle Cybersource payment webhooks
 * @access  Public (signature verified)
 */
router.post(
  '/webhook',
  paymentController.handleWebhook
);

module.exports = router;
