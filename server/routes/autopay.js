const express = require('express');
const router = express.Router();
const { RecurringSchedule, PaymentMethod, Lease } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/autopay/schedule
 * Get user's AutoPay schedule
 */
router.get('/schedule', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const schedule = await RecurringSchedule.findOne({
      where: {
        tenant_id: userId,
        is_active: true
      },
      include: [
        {
          model: PaymentMethod,
          attributes: ['id', 'payment_type', 'card_brand', 'card_last_four', 'account_last_four', 'bank_name']
        }
      ]
    });

    if (!schedule) {
      return res.json({
        success: true,
        data: { autopayEnabled: false }
      });
    }

    res.json({
      success: true,
      data: {
        autopayEnabled: true,
        schedule: {
          id: schedule.id,
          scheduleType: schedule.schedule_type,
          paymentDay: schedule.payment_day,
          amount: schedule.default_amount,
          nextPaymentDate: schedule.next_payment_date,
          paymentMethod: schedule.PaymentMethod
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching AutoPay schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AutoPay schedule'
    });
  }
});

/**
 * POST /api/autopay/setup
 * Set up AutoPay for rent payments
 */
router.post('/setup', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      leaseId,
      paymentMethodId,
      paymentDay,
      amount,
      scheduleType = 'monthly',
      startDate
    } = req.body;

    console.log('🔄 Setting up AutoPay for user:', userId);

    // Validate payment method belongs to user
    const paymentMethod = await PaymentMethod.findOne({
      where: {
        id: paymentMethodId,
        user_id: userId,
        status: 'active'
      }
    });

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method'
      });
    }

    // Validate lease
    const lease = await Lease.findOne({
      where: {
        id: leaseId,
        tenant_id: userId,
        status: 'active'
      }
    });

    if (!lease) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lease'
      });
    }

    // Deactivate any existing schedules
    await RecurringSchedule.update(
      { is_active: false },
      { where: { tenant_id: userId } }
    );

    // Calculate next payment date
    const now = new Date();
    const nextPaymentDate = new Date(startDate || now);
    if (!startDate) {
      nextPaymentDate.setDate(paymentDay);
      if (nextPaymentDate < now) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
    }

    // Create new recurring schedule
    const schedule = await RecurringSchedule.create({
      lease_id: leaseId,
      tenant_id: userId,
      payment_method_id: paymentMethodId,
      is_active: true,
      schedule_type: scheduleType,
      payment_day: paymentDay,
      start_date: startDate || now,
      default_amount: amount,
      next_payment_date: nextPaymentDate,
      send_reminder_email: true,
      reminder_days_before: 3,
      send_receipt_email: true,
      created_at: now,
      updated_at: now
    });

    console.log('✅ AutoPay schedule created:', schedule.id);

    res.json({
      success: true,
      message: 'AutoPay set up successfully',
      data: {
        scheduleId: schedule.id,
        nextPaymentDate: schedule.next_payment_date,
        amount: schedule.default_amount
      }
    });

  } catch (error) {
    console.error('❌ Error setting up AutoPay:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set up AutoPay'
    });
  }
});

/**
 * PUT /api/autopay/update
 * Update AutoPay settings
 */
router.put('/update', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scheduleId, paymentMethodId, paymentDay, amount } = req.body;

    const schedule = await RecurringSchedule.findOne({
      where: {
        id: scheduleId,
        tenant_id: userId
      }
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }

    // Update schedule
    await schedule.update({
      payment_method_id: paymentMethodId || schedule.payment_method_id,
      payment_day: paymentDay || schedule.payment_day,
      default_amount: amount || schedule.default_amount,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'AutoPay updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating AutoPay:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AutoPay'
    });
  }
});

/**
 * DELETE /api/autopay/cancel
 * Cancel AutoPay
 */
router.delete('/cancel', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    await RecurringSchedule.update(
      { is_active: false },
      { where: { tenant_id: userId } }
    );

    res.json({
      success: true,
      message: 'AutoPay cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling AutoPay:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel AutoPay'
    });
  }
});

module.exports = router;
