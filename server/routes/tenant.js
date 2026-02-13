const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication and tenant role
router.use(authenticate);
router.use(authorize('tenant'));

// ============================================
// DASHBOARD
// ============================================

/**
 * @route   GET /api/tenant/dashboard
 * @desc    Get tenant dashboard (lease info, next payment, recent activity)
 * @access  Private/Tenant
 */
router.get('/dashboard', tenantController.getDashboard);

// ============================================
// PAYMENT HISTORY
// ============================================

/**
 * @route   GET /api/tenant/payments
 * @desc    Get payment history with pagination and filters
 * @access  Private/Tenant
 * @query   ?page=1&limit=10&status=completed&year=2024
 */
router.get('/payments', tenantController.getPaymentHistory);

/**
 * @route   GET /api/tenant/payments/:id
 * @desc    Get specific payment details
 * @access  Private/Tenant
 */
router.get('/payments/:id', tenantController.getPaymentDetails);

// ============================================
// PAYMENT METHODS
// ============================================

/**
 * @route   GET /api/tenant/payment-methods
 * @desc    Get all saved payment methods
 * @access  Private/Tenant
 */
router.get('/payment-methods', tenantController.getPaymentMethods);

/**
 * @route   POST /api/tenant/payment-methods
 * @desc    Add new payment method (card or ACH)
 * @access  Private/Tenant
 */
router.post('/payment-methods', tenantController.addPaymentMethod);

/**
 * @route   PUT /api/tenant/payment-methods/:id
 * @desc    Update payment method (nickname, default status)
 * @access  Private/Tenant
 */
router.put('/payment-methods/:id', tenantController.updatePaymentMethod);

/**
 * @route   DELETE /api/tenant/payment-methods/:id
 * @desc    Delete payment method
 * @access  Private/Tenant
 */
router.delete('/payment-methods/:id', tenantController.deletePaymentMethod);

// ============================================
// AUTO-PAY / RECURRING SCHEDULES
// ============================================

/**
 * @route   GET /api/tenant/recurring-schedule
 * @desc    Get active auto-pay schedule
 * @access  Private/Tenant
 */
router.get('/recurring-schedule', tenantController.getRecurringSchedule);

/**
 * @route   POST /api/tenant/recurring-schedule
 * @desc    Set up auto-pay schedule
 * @access  Private/Tenant
 */
router.post('/recurring-schedule', tenantController.createRecurringSchedule);

/**
 * @route   PUT /api/tenant/recurring-schedule/:id
 * @desc    Update auto-pay schedule settings
 * @access  Private/Tenant
 */
router.put('/recurring-schedule/:id', tenantController.updateRecurringSchedule);

/**
 * @route   DELETE /api/tenant/recurring-schedule/:id
 * @desc    Cancel auto-pay schedule
 * @access  Private/Tenant
 */
router.delete('/recurring-schedule/:id', tenantController.cancelRecurringSchedule);

module.exports = router;
