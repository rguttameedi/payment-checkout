const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication and admin/property_manager role
router.use(authenticate);
router.use(authorize('admin', 'property_manager'));

// ============================================
// DASHBOARD
// ============================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics and overview
 * @access  Private/Admin/PropertyManager
 */
router.get('/dashboard', adminController.getDashboard);

// ============================================
// PROPERTIES MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/properties
 * @desc    Get all properties with pagination
 * @access  Private/Admin/PropertyManager
 * @query   ?page=1&limit=10&search=oakhill
 */
router.get('/properties', adminController.getProperties);

/**
 * @route   GET /api/admin/properties/:id
 * @desc    Get property details with units
 * @access  Private/Admin/PropertyManager
 */
router.get('/properties/:id', adminController.getPropertyDetails);

/**
 * @route   POST /api/admin/properties
 * @desc    Create new property
 * @access  Private/Admin/PropertyManager
 */
router.post('/properties', adminController.createProperty);

/**
 * @route   PUT /api/admin/properties/:id
 * @desc    Update property
 * @access  Private/Admin/PropertyManager
 */
router.put('/properties/:id', adminController.updateProperty);

/**
 * @route   DELETE /api/admin/properties/:id
 * @desc    Delete property
 * @access  Private/Admin (only admin, not property_manager)
 */
router.delete('/properties/:id', authorize('admin'), adminController.deleteProperty);

// ============================================
// UNITS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/properties/:propertyId/units
 * @desc    Get all units in a property
 * @access  Private/Admin/PropertyManager
 * @query   ?status=vacant
 */
router.get('/properties/:propertyId/units', adminController.getUnits);

/**
 * @route   POST /api/admin/properties/:propertyId/units
 * @desc    Create new unit in property
 * @access  Private/Admin/PropertyManager
 */
router.post('/properties/:propertyId/units', adminController.createUnit);

/**
 * @route   PUT /api/admin/units/:id
 * @desc    Update unit
 * @access  Private/Admin/PropertyManager
 */
router.put('/units/:id', adminController.updateUnit);

/**
 * @route   DELETE /api/admin/units/:id
 * @desc    Delete unit
 * @access  Private/Admin (only admin)
 */
router.delete('/units/:id', authorize('admin'), adminController.deleteUnit);

// ============================================
// TENANTS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/tenants
 * @desc    Get all tenants with their leases
 * @access  Private/Admin/PropertyManager
 * @query   ?page=1&limit=20&search=john&status=active
 */
router.get('/tenants', adminController.getTenants);

// ============================================
// LEASES MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/leases
 * @desc    Get all leases with filters
 * @access  Private/Admin/PropertyManager
 * @query   ?page=1&limit=20&status=active&property_id=1
 */
router.get('/leases', adminController.getLeases);

/**
 * @route   POST /api/admin/leases
 * @desc    Create new lease
 * @access  Private/Admin/PropertyManager
 */
router.post('/leases', adminController.createLease);

/**
 * @route   PUT /api/admin/leases/:id
 * @desc    Update lease
 * @access  Private/Admin/PropertyManager
 */
router.put('/leases/:id', adminController.updateLease);

/**
 * @route   PUT /api/admin/leases/:id/terminate
 * @desc    Terminate lease and mark unit as vacant
 * @access  Private/Admin/PropertyManager
 */
router.put('/leases/:id/terminate', adminController.terminateLease);

// ============================================
// PAYMENTS MONITORING
// ============================================

/**
 * @route   GET /api/admin/payments
 * @desc    View all payments with filters
 * @access  Private/Admin/PropertyManager
 * @query   ?page=1&limit=20&status=completed&month=2&year=2024&property_id=1&tenant_id=5
 */
router.get('/payments', adminController.getPayments);

module.exports = router;
