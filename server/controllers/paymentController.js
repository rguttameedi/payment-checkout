const paymentService = require('../services/paymentService');
const { RentPayment, Lease, PaymentMethod, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Payment Controller
 * Handles rent payment processing and management
 */

/**
 * Initiate a one-time rent payment
 */
exports.initiatePayment = async (req, res, next) => {
  try {
    const tenantId = req.user.id;
    const {
      lease_id,
      payment_method_id,
      amount,
      payment_month,
      payment_year
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
        user_id: tenantId
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Check if payment already exists for this period
    const existingPayment = await RentPayment.findOne({
      where: {
        lease_id,
        payment_month,
        payment_year,
        payment_status: {
          [Op.in]: ['pending', 'processing', 'completed', 'captured']
        }
      }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment for this period already exists'
      });
    }

    // Get tenant info
    const tenant = await User.findByPk(tenantId);

    // Process payment with Cybersource
    const paymentResult = await paymentService.processPayment({
      amount,
      payment_token: paymentMethod.cybersource_token,
      customer_info: {
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        email: tenant.email,
        address: paymentMethod.billing_address
      },
      order_id: `rent_${lease_id}_${payment_month}_${payment_year}`,
      description: `Rent payment for ${payment_month}/${payment_year}`
    });

    if (!paymentResult.success) {
      // Create failed payment record
      await RentPayment.create({
        lease_id,
        payment_method_id,
        total_amount: amount,
        payment_month,
        payment_year,
        payment_status: 'failed',
        payment_date: new Date(),
        failure_reason: paymentResult.error?.message || 'Payment processing failed'
      });

      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        error: paymentResult.error
      });
    }

    // Create successful payment record
    const payment = await RentPayment.create({
      lease_id,
      payment_method_id,
      total_amount: amount,
      payment_month,
      payment_year,
      payment_status: paymentResult.status,
      payment_date: new Date(),
      transaction_id: paymentResult.transaction_id,
      authorization_code: paymentResult.authorization_code,
      processor_response: paymentResult.response_code
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment_id: payment.id,
        transaction_id: paymentResult.transaction_id,
        amount: amount,
        status: paymentResult.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process recurring payment (called by scheduler)
 */
exports.processRecurringPayment = async (scheduleId) => {
  try {
    const { RecurringPaymentSchedule } = require('../models');

    // Get schedule with related data
    const schedule = await RecurringPaymentSchedule.findByPk(scheduleId, {
      include: [
        { model: Lease, as: 'lease', include: [{ model: User, as: 'tenant' }] },
        { model: PaymentMethod, as: 'payment_method' }
      ]
    });

    if (!schedule || schedule.status !== 'active') {
      return { success: false, message: 'Schedule not found or inactive' };
    }

    const currentDate = new Date();
    const payment_month = currentDate.getMonth() + 1;
    const payment_year = currentDate.getFullYear();

    // Check if payment already exists
    const existingPayment = await RentPayment.findOne({
      where: {
        lease_id: schedule.lease_id,
        payment_month,
        payment_year,
        payment_status: {
          [Op.in]: ['completed', 'captured', 'processing']
        }
      }
    });

    if (existingPayment) {
      return { success: false, message: 'Payment already processed for this period' };
    }

    // Process payment
    const paymentResult = await paymentService.processPayment({
      amount: schedule.lease.monthly_rent,
      payment_token: schedule.payment_method.cybersource_token,
      customer_info: {
        first_name: schedule.lease.tenant.first_name,
        last_name: schedule.lease.tenant.last_name,
        email: schedule.lease.tenant.email,
        address: schedule.payment_method.billing_address
      },
      order_id: `recurring_${schedule.id}_${payment_month}_${payment_year}`,
      description: `Auto-pay rent for ${payment_month}/${payment_year}`
    });

    if (!paymentResult.success) {
      // Record failed attempt
      await RentPayment.create({
        lease_id: schedule.lease_id,
        payment_method_id: schedule.payment_method_id,
        total_amount: schedule.lease.monthly_rent,
        payment_month,
        payment_year,
        payment_status: 'failed',
        payment_date: new Date(),
        failure_reason: paymentResult.error?.message || 'Auto-pay failed'
      });

      return {
        success: false,
        message: 'Recurring payment failed',
        error: paymentResult.error
      };
    }

    // Create successful payment record
    await RentPayment.create({
      lease_id: schedule.lease_id,
      payment_method_id: schedule.payment_method_id,
      total_amount: schedule.lease.monthly_rent,
      payment_month,
      payment_year,
      payment_status: paymentResult.status,
      payment_date: new Date(),
      transaction_id: paymentResult.transaction_id,
      authorization_code: paymentResult.authorization_code,
      processor_response: paymentResult.response_code
    });

    // Update last payment date
    await schedule.update({
      last_payment_date: new Date(),
      next_payment_date: calculateNextPaymentDate(schedule.payment_day)
    });

    return {
      success: true,
      transaction_id: paymentResult.transaction_id
    };
  } catch (error) {
    console.error('Recurring payment error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Refund a payment
 */
exports.refundPayment = async (req, res, next) => {
  try {
    const { payment_id } = req.params;
    const { amount, reason } = req.body;

    // Find payment
    const payment = await RentPayment.findByPk(payment_id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.payment_status !== 'completed' && payment.payment_status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    const refundAmount = amount || payment.total_amount;

    if (parseFloat(refundAmount) > parseFloat(payment.total_amount)) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // Process refund with Cybersource
    const refundResult = await paymentService.refundPayment(
      payment.transaction_id,
      refundAmount,
      reason || 'Refund requested'
    );

    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Refund failed',
        error: refundResult.error
      });
    }

    // Update payment record
    await payment.update({
      payment_status: 'refunded',
      refund_amount: refundAmount,
      refund_date: new Date(),
      refund_reason: reason,
      refund_transaction_id: refundResult.refund_id
    });

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        refund_id: refundResult.refund_id,
        amount: refundAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment status
 */
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { payment_id } = req.params;
    const userId = req.user.id;

    const payment = await RentPayment.findOne({
      where: { id: payment_id },
      include: [
        {
          model: Lease,
          as: 'lease',
          where: req.user.role === 'tenant' ? { tenant_id: userId } : {}
        },
        { model: PaymentMethod, as: 'payment_method' }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Optionally fetch latest status from Cybersource
    if (payment.transaction_id) {
      const statusResult = await paymentService.getPaymentDetails(payment.transaction_id);

      if (statusResult.success) {
        const currentStatus = statusResult.transaction.applicationInformation?.status;

        // Update if status changed
        if (currentStatus && currentStatus !== payment.payment_status) {
          await payment.update({ payment_status: currentStatus });
        }
      }
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
 * Handle payment webhooks from Cybersource
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-cybersource-signature'];
    const payload = req.body;

    // Verify webhook signature
    const isValid = paymentService.verifyWebhookSignature(payload, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Process webhook event
    const { eventType, data } = payload;

    switch (eventType) {
      case 'payment.authorized':
        await handlePaymentAuthorized(data);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(data);
        break;

      case 'refund.completed':
        await handleRefundCompleted(data);
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    next(error);
  }
};

// Helper functions

function calculateNextPaymentDate(paymentDay) {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);
  return nextMonth;
}

async function handlePaymentAuthorized(data) {
  const payment = await RentPayment.findOne({
    where: { transaction_id: data.id }
  });

  if (payment) {
    await payment.update({ payment_status: 'authorized' });
  }
}

async function handlePaymentCaptured(data) {
  const payment = await RentPayment.findOne({
    where: { transaction_id: data.id }
  });

  if (payment) {
    await payment.update({ payment_status: 'captured' });
  }
}

async function handlePaymentFailed(data) {
  const payment = await RentPayment.findOne({
    where: { transaction_id: data.id }
  });

  if (payment) {
    await payment.update({
      payment_status: 'failed',
      failure_reason: data.reason || 'Payment failed'
    });
  }
}

async function handleRefundCompleted(data) {
  const payment = await RentPayment.findOne({
    where: { refund_transaction_id: data.id }
  });

  if (payment) {
    await payment.update({ payment_status: 'refunded' });
  }
}

module.exports = exports;
