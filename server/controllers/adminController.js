const { User, Property, Unit, Lease, RentPayment, PaymentMethod, RecurringSchedule } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin/Property Manager only)
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // Get counts
    const totalProperties = await Property.count();
    const totalUnits = await Unit.count();
    const occupiedUnits = await Unit.count({ where: { status: 'occupied' } });
    const totalTenants = await User.count({ where: { role: 'tenant' } });
    const activeLeases = await Lease.count({ where: { status: 'active' } });

    // Get payment statistics for current month
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const monthlyRevenue = await RentPayment.sum('total_amount', {
      where: {
        payment_month: currentMonth,
        payment_year: currentYear,
        payment_status: { [Op.in]: ['completed', 'captured'] }
      }
    });

    const pendingPayments = await RentPayment.count({
      where: {
        payment_month: currentMonth,
        payment_year: currentYear,
        payment_status: 'pending'
      }
    });

    // Recent payments
    const recentPayments = await RentPayment.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'tenant', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Lease, as: 'lease', include: [{ model: Unit, as: 'unit' }] }
      ]
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProperties,
          totalUnits,
          occupiedUnits,
          vacantUnits: totalUnits - occupiedUnits,
          occupancyRate: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(2) : 0,
          totalTenants,
          activeLeases
        },
        financial: {
          monthlyRevenue: monthlyRevenue || 0,
          pendingPayments,
          currentMonth: today.toLocaleString('default', { month: 'long' }),
          currentYear
        },
        recentPayments
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// PROPERTIES MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/properties
 * @desc    Get all properties with pagination
 * @access  Private (Admin/Property Manager)
 */
exports.getProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      include: [
        { model: User, as: 'propertyManager', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/properties/:id
 * @desc    Get property details with units
 * @access  Private (Admin/Property Manager)
 */
exports.getPropertyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id, {
      include: [
        { model: User, as: 'propertyManager' },
        { model: Unit, as: 'units', include: [{ model: Lease, as: 'leases', where: { status: 'active' }, required: false }] }
      ]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/properties
 * @desc    Create new property
 * @access  Private (Admin/Property Manager)
 */
exports.createProperty = async (req, res, next) => {
  try {
    const {
      name,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
      country,
      property_manager_id,
      total_units,
      property_type,
      description
    } = req.body;

    const property = await Property.create({
      name,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
      country: country || 'US',
      property_manager_id,
      total_units: total_units || 0,
      property_type,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/properties/:id
 * @desc    Update property
 * @access  Private (Admin/Property Manager)
 */
exports.updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await property.update(updates);

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/properties/:id
 * @desc    Delete property
 * @access  Private (Admin only)
 */
exports.deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property has units
    const unitsCount = await Unit.count({ where: { property_id: id } });

    if (unitsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete property with existing units'
      });
    }

    await property.destroy();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// UNITS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/properties/:propertyId/units
 * @desc    Get all units in a property
 * @access  Private (Admin/Property Manager)
 */
exports.getUnits = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { status } = req.query;

    const where = { property_id: propertyId };
    if (status) {
      where.status = status;
    }

    const units = await Unit.findAll({
      where,
      include: [
        {
          model: Lease,
          as: 'leases',
          where: { status: 'active' },
          required: false,
          include: [{ model: User, as: 'tenant', attributes: ['id', 'first_name', 'last_name', 'email'] }]
        }
      ],
      order: [['unit_number', 'ASC']]
    });

    res.json({
      success: true,
      data: units
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/properties/:propertyId/units
 * @desc    Create new unit
 * @access  Private (Admin/Property Manager)
 */
exports.createUnit = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const {
      unit_number,
      bedrooms,
      bathrooms,
      square_feet,
      floor_number,
      monthly_rent,
      security_deposit,
      description
    } = req.body;

    // Verify property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const unit = await Unit.create({
      property_id: propertyId,
      unit_number,
      bedrooms,
      bathrooms,
      square_feet,
      floor_number,
      monthly_rent,
      security_deposit,
      status: 'vacant',
      description
    });

    res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/units/:id
 * @desc    Update unit
 * @access  Private (Admin/Property Manager)
 */
exports.updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    await unit.update(updates);

    res.json({
      success: true,
      message: 'Unit updated successfully',
      data: unit
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/units/:id
 * @desc    Delete unit
 * @access  Private (Admin only)
 */
exports.deleteUnit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Check if unit has active leases
    const activeLease = await Lease.findOne({
      where: {
        unit_id: id,
        status: 'active'
      }
    });

    if (activeLease) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete unit with active lease'
      });
    }

    await unit.destroy();

    res.json({
      success: true,
      message: 'Unit deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// TENANTS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/tenants
 * @desc    Get all tenants
 * @access  Private (Admin/Property Manager)
 */
exports.getTenants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { role: 'tenant' };

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows: tenants } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Lease,
          as: 'leases',
          where: { status: 'active' },
          required: false,
          include: [{ model: Unit, as: 'unit', include: [{ model: Property, as: 'property' }] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        tenants,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// LEASES MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/leases
 * @desc    Get all leases
 * @access  Private (Admin/Property Manager)
 */
exports.getLeases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, property_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const include = [
      { model: User, as: 'tenant', attributes: ['id', 'first_name', 'last_name', 'email'] },
      {
        model: Unit,
        as: 'unit',
        include: [{ model: Property, as: 'property' }]
      }
    ];

    // Filter by property if specified
    if (property_id) {
      include[1].where = { property_id };
    }

    const { count, rows: leases } = await Lease.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['lease_start_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        leases,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/leases
 * @desc    Create new lease
 * @access  Private (Admin/Property Manager)
 */
exports.createLease = async (req, res, next) => {
  try {
    const {
      unit_id,
      tenant_id,
      monthly_rent,
      security_deposit,
      lease_start_date,
      lease_end_date,
      rent_due_day,
      payment_grace_period_days,
      late_fee_amount,
      notes
    } = req.body;

    // Verify unit exists and is available
    const unit = await Unit.findByPk(unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Check if unit has active lease
    const existingLease = await Lease.findOne({
      where: {
        unit_id,
        status: 'active',
        lease_end_date: { [Op.gte]: new Date() }
      }
    });

    if (existingLease) {
      return res.status(400).json({
        success: false,
        message: 'Unit already has an active lease'
      });
    }

    // Verify tenant exists
    const tenant = await User.findOne({
      where: { id: tenant_id, role: 'tenant' }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const lease = await Lease.create({
      unit_id,
      tenant_id,
      monthly_rent,
      security_deposit,
      lease_start_date,
      lease_end_date,
      rent_due_day: rent_due_day || 1,
      status: 'active',
      payment_grace_period_days: payment_grace_period_days || 5,
      late_fee_amount: late_fee_amount || 0,
      notes
    });

    // Update unit status to occupied
    await unit.update({ status: 'occupied' });

    res.status(201).json({
      success: true,
      message: 'Lease created successfully',
      data: lease
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/leases/:id
 * @desc    Update lease
 * @access  Private (Admin/Property Manager)
 */
exports.updateLease = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lease = await Lease.findByPk(id);

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found'
      });
    }

    await lease.update(updates);

    res.json({
      success: true,
      message: 'Lease updated successfully',
      data: lease
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/leases/:id/terminate
 * @desc    Terminate lease
 * @access  Private (Admin/Property Manager)
 */
exports.terminateLease = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lease = await Lease.findByPk(id, {
      include: [{ model: Unit, as: 'unit' }]
    });

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Lease not found'
      });
    }

    await lease.update({ status: 'terminated' });

    // Update unit status to vacant
    await lease.unit.update({ status: 'vacant' });

    res.json({
      success: true,
      message: 'Lease terminated successfully',
      data: lease
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// PAYMENTS MONITORING
// ============================================

/**
 * @route   GET /api/admin/payments
 * @desc    View all payments with filters
 * @access  Private (Admin/Property Manager)
 */
exports.getPayments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      month,
      year,
      property_id,
      tenant_id
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.payment_status = status;
    }

    if (month) {
      where.payment_month = parseInt(month);
    }

    if (year) {
      where.payment_year = parseInt(year);
    }

    if (tenant_id) {
      where.tenant_id = tenant_id;
    }

    const include = [
      { model: User, as: 'tenant', attributes: ['id', 'first_name', 'last_name', 'email'] },
      {
        model: Lease,
        as: 'lease',
        include: [
          {
            model: Unit,
            as: 'unit',
            include: [{ model: Property, as: 'property' }]
          }
        ]
      }
    ];

    // Filter by property if specified
    if (property_id) {
      include[1].include[0].include[0].where = { id: property_id };
    }

    const { count, rows: payments } = await RentPayment.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
