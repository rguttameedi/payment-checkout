const { Lease, Unit, Property, PaymentMethod, RentPayment, RecurringSchedule, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/tenant/dashboard
 * @desc    Get tenant dashboard data (active lease, next payment due, recent payments)
 * @access  Private (Tenant only)
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const tenantId = req.user.id;

    // Get active lease with unit and property details
    const activeLease = await Lease.findOne({
      where: {
        tenant_id: tenantId,
        status: 'active',
        lease_end_date: { [Op.gte]: new Date() }
      },
      include: [
        {
          model: Unit,
          as: 'unit',
          include: [
            { model: Property, as: 'property' }
          ]
        }
      ],
      order: [['lease_start_date', 'DESC']]
    });

    if (!activeLease) {
      return res.status(404).json({
        success: false,
        message: 'No active lease found'
      });
    }

    // Get next payment due date
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Determine which month/year we should check for payment
    let paymentCheckMonth = currentMonth;
    let paymentCheckYear = currentYear;

    let nextPaymentDueDate = new Date(currentYear, currentMonth - 1, activeLease.rent_due_day);
    if (nextPaymentDueDate < today) {
      // If this month's due date passed, next payment is next month
      nextPaymentDueDate = new Date(currentYear, currentMonth, activeLease.rent_due_day);
      paymentCheckMonth = currentMonth + 1;
      if (paymentCheckMonth > 12) {
        paymentCheckMonth = 1;
        paymentCheckYear = currentYear + 1;
      }
    }

    // Calculate total paid for the payment period (including partial payments)
    const periodPayments = await RentPayment.findAll({
      where: {
        lease_id: activeLease.id,
        payment_month: paymentCheckMonth,
        payment_year: paymentCheckYear,
        payment_status: { [Op.in]: ['completed', 'authorized', 'captured'] }
      }
    });

    // Sum all payments for the payment period
    const totalPaidThisPeriod = periodPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.total_amount || 0);
    }, 0);

    // Calculate remaining balance
    const remainingBalance = Math.max(0, parseFloat(activeLease.monthly_rent) - totalPaidThisPeriod);
    const isFullyPaid = remainingBalance === 0;

    // Get recent payments (last 3)
    const recentPayments = await RentPayment.findAll({
      where: { tenant_id: tenantId },
      order: [['payment_date', 'DESC']],
      limit: 3
    });

    // Get auto-pay status
    const autoPaySchedule = await RecurringSchedule.findOne({
      where: {
        tenant_id: tenantId,
        lease_id: activeLease.id,
        is_active: true
      },
      include: [{ model: PaymentMethod, as: 'paymentMethod' }]
    });

    res.json({
      success: true,
      data: {
        lease: {
          id: activeLease.id,
          unit: activeLease.unit,
          monthlyRent: activeLease.monthly_rent,
          leaseStartDate: activeLease.lease_start_date,
          leaseEndDate: activeLease.lease_end_date,
          rentDueDay: activeLease.rent_due_day,
          status: activeLease.status
        },
        nextPayment: {
          dueDate: nextPaymentDueDate,
          amount: remainingBalance,
          totalDue: activeLease.monthly_rent,
          amountPaid: totalPaidThisPeriod,
          isPaid: isFullyPaid,
          daysUntilDue: Math.ceil((nextPaymentDueDate - today) / (1000 * 60 * 60 * 24))
        },
        recentPayments,
        autoPayEnabled: !!autoPaySchedule,
        autoPayDetails: autoPaySchedule || null
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tenant/payments
 * @desc    Get payment history with pagination
 * @access  Private (Tenant only)
 */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const tenantId = req.user.id;
    const { page = 1, limit = 10, status, year } = req.query;

    const offset = (page - 1) * limit;
    const where = { tenant_id: tenantId };

    if (status) {
      where.payment_status = status;
    }

    if (year) {
      where.payment_year = parseInt(year);
    }

    const { count, rows: payments } = await RentPayment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['payment_date', 'DESC']],
      include: [
        { model: Lease, as: 'lease', include: [{ model: Unit, as: 'unit' }] },
        { model: PaymentMethod, as: 'paymentMethod' }
      ]
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

/**
 * @route   GET /api/tenant/payments/:id
 * @desc    Get specific payment details
 * @access  Private (Tenant only)
 */
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.id;

    const payment = await RentPayment.findOne({
      where: {
        id,
        tenant_id: tenantId
      },
      include: [
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
        },
        { model: PaymentMethod, as: 'paymentMethod' }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tenant/payment-methods
 * @desc    Get all saved payment methods
 * @access  Private (Tenant only)
 */
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await PaymentMethod.findAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
      attributes: { exclude: ['cybersource_token'] } // Don't expose tokens in list
    });

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tenant/payment-methods
 * @desc    Add new payment method
 * @access  Private (Tenant only)
 */
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      payment_type,
      nickname,
      cybersource_token,
      card_last_four,
      card_brand,
      card_expiry_month,
      card_expiry_year,
      account_last_four,
      account_type,
      bank_name,
      billing_address,
      is_default
    } = req.body;

    // If setting as default, unset other defaults
    if (is_default) {
      await PaymentMethod.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    const paymentMethod = await PaymentMethod.create({
      user_id: userId,
      payment_type,
      nickname,
      cybersource_token,
      card_last_four,
      card_brand,
      card_expiry_month,
      card_expiry_year,
      account_last_four,
      account_type,
      bank_name,
      billing_address_line1: billing_address?.line1,
      billing_address_line2: billing_address?.line2,
      billing_city: billing_address?.city,
      billing_state: billing_address?.state,
      billing_zip_code: billing_address?.zip_code,
      billing_country: billing_address?.country || 'US',
      is_default: is_default || false,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tenant/payment-methods/:id
 * @desc    Update payment method (nickname, default status)
 * @access  Private (Tenant only)
 */
exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { nickname, is_default } = req.body;

    const paymentMethod = await PaymentMethod.findOne({
      where: { id, user_id: userId }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await PaymentMethod.update(
        { is_default: false },
        { where: { user_id: userId, id: { [Op.ne]: id } } }
      );
    }

    await paymentMethod.update({
      nickname: nickname || paymentMethod.nickname,
      is_default: is_default !== undefined ? is_default : paymentMethod.is_default
    });

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tenant/payment-methods/:id
 * @desc    Delete/deactivate payment method
 * @access  Private (Tenant only)
 */
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const paymentMethod = await PaymentMethod.findOne({
      where: { id, user_id: userId }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Check if it's used in active recurring schedule
    const activeSchedule = await RecurringSchedule.findOne({
      where: {
        payment_method_id: id,
        is_active: true
      }
    });

    if (activeSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete payment method used in active auto-pay schedule'
      });
    }

    // Soft delete - mark as deleted
    await paymentMethod.update({ status: 'deleted' });

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tenant/recurring-schedule
 * @desc    Get auto-pay schedule
 * @access  Private (Tenant only)
 */
exports.getRecurringSchedule = async (req, res, next) => {
  try {
    const tenantId = req.user.id;

    const schedule = await RecurringSchedule.findOne({
      where: {
        tenant_id: tenantId,
        is_active: true
      },
      include: [
        { model: Lease, as: 'lease' },
        { model: PaymentMethod, as: 'paymentMethod' }
      ]
    });

    if (!schedule) {
      return res.json({
        success: true,
        data: null,
        message: 'No active auto-pay schedule'
      });
    }

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tenant/recurring-schedule
 * @desc    Set up auto-pay schedule
 * @access  Private (Tenant only)
 */
exports.createRecurringSchedule = async (req, res, next) => {
  try {
    const tenantId = req.user.id;
    const {
      lease_id,
      payment_method_id,
      payment_day,
      send_reminder_email,
      reminder_days_before
    } = req.body;

    // Verify lease belongs to tenant
    const lease = await Lease.findOne({
      where: {
        id: lease_id,
        tenant_id: tenantId,
        status: 'active'
      }
    });

    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Active lease not found'
      });
    }

    // Verify payment method belongs to tenant
    const paymentMethod = await PaymentMethod.findOne({
      where: {
        id: payment_method_id,
        user_id: tenantId,
        status: 'active'
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Deactivate any existing schedules for this lease
    await RecurringSchedule.update(
      { is_active: false },
      { where: { lease_id, tenant_id: tenantId } }
    );

    // Calculate next payment date
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, payment_day);

    const schedule = await RecurringSchedule.create({
      lease_id,
      tenant_id: tenantId,
      payment_method_id,
      is_active: true,
      schedule_type: 'monthly',
      payment_day,
      start_date: today,
      default_amount: lease.monthly_rent,
      next_payment_date: nextMonth,
      send_reminder_email: send_reminder_email !== false,
      reminder_days_before: reminder_days_before || 3,
      send_receipt_email: true
    });

    res.status(201).json({
      success: true,
      message: 'Auto-pay schedule created successfully',
      data: schedule
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tenant/recurring-schedule/:id
 * @desc    Update auto-pay schedule
 * @access  Private (Tenant only)
 */
exports.updateRecurringSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.id;
    const {
      payment_method_id,
      payment_day,
      send_reminder_email,
      reminder_days_before
    } = req.body;

    const schedule = await RecurringSchedule.findOne({
      where: { id, tenant_id: tenantId }
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Auto-pay schedule not found'
      });
    }

    // If changing payment method, verify it exists
    if (payment_method_id) {
      const paymentMethod = await PaymentMethod.findOne({
        where: {
          id: payment_method_id,
          user_id: tenantId,
          status: 'active'
        }
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }
    }

    await schedule.update({
      payment_method_id: payment_method_id || schedule.payment_method_id,
      payment_day: payment_day || schedule.payment_day,
      send_reminder_email: send_reminder_email !== undefined ? send_reminder_email : schedule.send_reminder_email,
      reminder_days_before: reminder_days_before || schedule.reminder_days_before
    });

    res.json({
      success: true,
      message: 'Auto-pay schedule updated successfully',
      data: schedule
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tenant/recurring-schedule/:id
 * @desc    Cancel auto-pay schedule
 * @access  Private (Tenant only)
 */
exports.cancelRecurringSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.id;

    const schedule = await RecurringSchedule.findOne({
      where: { id, tenant_id: tenantId }
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Auto-pay schedule not found'
      });
    }

    await schedule.update({ is_active: false });

    res.json({
      success: true,
      message: 'Auto-pay schedule cancelled successfully'
    });

  } catch (error) {
    next(error);
  }
};
