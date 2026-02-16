const express = require('express');
const router = express.Router();
const { FlexiblePaymentPlan, FlexiblePaymentSchedule, PaymentMethod, Lease, RentPayment } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/flexible-payment/plans
 * Get user's flexible payment plans
 */
router.get('/plans', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const plans = await FlexiblePaymentPlan.findAll({
      where: {
        tenant_id: userId
      },
      include: [
        {
          model: PaymentMethod,
          as: 'paymentMethod',
          attributes: ['id', 'payment_type', 'card_brand', 'card_last_four', 'account_last_four']
        },
        {
          model: Lease,
          as: 'lease',
          attributes: ['id', 'unit_id', 'monthly_rent']
        },
        {
          model: FlexiblePaymentSchedule,
          as: 'schedules',
          where: { status: ['scheduled', 'processing'] },
          required: false,
          limit: 5,
          order: [['scheduled_date', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { plans }
    });

  } catch (error) {
    console.error('❌ Error fetching flexible payment plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flexible payment plans'
    });
  }
});

/**
 * GET /api/flexible-payment/plan/:id
 * Get specific plan details with full schedule
 */
router.get('/plan/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const plan = await FlexiblePaymentPlan.findOne({
      where: {
        id,
        tenant_id: userId
      },
      include: [
        {
          model: PaymentMethod,
          as: 'paymentMethod'
        },
        {
          model: Lease,
          as: 'lease'
        },
        {
          model: FlexiblePaymentSchedule,
          as: 'schedules',
          order: [['scheduled_date', 'ASC']]
        }
      ]
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: { plan }
    });

  } catch (error) {
    console.error('❌ Error fetching plan details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan details'
    });
  }
});

/**
 * POST /api/flexible-payment/create
 * Create a new flexible payment plan
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      leaseId,
      paymentMethodId,
      planName,
      frequency,
      startDate,
      paymentDayOfWeek,
      autoPayEnabled = true
    } = req.body;

    console.log('🔄 Creating flexible payment plan for user:', userId);

    // Validate payment method
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

    const monthlyRent = parseFloat(lease.monthly_rent);

    // Calculate payment amount based on frequency
    let paymentAmount;
    let paymentsPerMonth;

    if (frequency === 'weekly') {
      // Approximate: 52 weeks / 12 months = 4.33 weeks per month
      paymentsPerMonth = 4.33;
      paymentAmount = (monthlyRent / paymentsPerMonth).toFixed(2);
    } else if (frequency === 'biweekly') {
      // 26 biweekly periods / 12 months = 2.17 payments per month
      paymentsPerMonth = 2.17;
      paymentAmount = (monthlyRent / paymentsPerMonth).toFixed(2);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid frequency. Must be "weekly" or "biweekly"'
      });
    }

    // Calculate next payment date
    const now = new Date();
    const start = new Date(startDate || now);
    let nextPaymentDate = new Date(start);

    if (frequency === 'weekly' && paymentDayOfWeek !== undefined) {
      // Set to the next occurrence of the specified day of week
      const daysUntilPaymentDay = (paymentDayOfWeek - start.getDay() + 7) % 7;
      nextPaymentDate.setDate(start.getDate() + daysUntilPaymentDay);
      if (nextPaymentDate < now) {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      }
    } else if (frequency === 'biweekly') {
      // Start on the start date, then every 14 days
      if (nextPaymentDate < now) {
        const daysDiff = Math.ceil((now - nextPaymentDate) / (1000 * 60 * 60 * 24));
        const periods = Math.ceil(daysDiff / 14);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + (periods * 14));
      }
    }

    // Create the flexible payment plan
    const plan = await FlexiblePaymentPlan.create({
      lease_id: leaseId,
      tenant_id: userId,
      payment_method_id: paymentMethodId,
      plan_name: planName,
      frequency,
      payment_amount: paymentAmount,
      total_monthly_amount: monthlyRent,
      start_date: start,
      next_payment_date: nextPaymentDate,
      payment_day_of_week: paymentDayOfWeek,
      is_active: true,
      status: 'active',
      auto_pay_enabled: autoPayEnabled,
      send_reminder_email: true,
      reminder_days_before: 2,
      created_at: now,
      updated_at: now
    });

    // Generate initial payment schedules (next 3 months)
    await generatePaymentSchedules(plan.id, frequency, nextPaymentDate, paymentAmount, 13);

    console.log('✅ Flexible payment plan created:', plan.id);

    res.json({
      success: true,
      message: 'Flexible payment plan created successfully',
      data: {
        planId: plan.id,
        frequency,
        paymentAmount,
        nextPaymentDate: plan.next_payment_date
      }
    });

  } catch (error) {
    console.error('❌ Error creating flexible payment plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create flexible payment plan'
    });
  }
});

/**
 * Helper function to generate payment schedules
 */
async function generatePaymentSchedules(planId, frequency, startDate, amount, count) {
  const schedules = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    schedules.push({
      plan_id: planId,
      scheduled_date: new Date(currentDate),
      amount: amount,
      status: 'scheduled',
      retry_count: 0,
      reminder_sent: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Calculate next payment date
    if (frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (frequency === 'biweekly') {
      currentDate.setDate(currentDate.getDate() + 14);
    }
  }

  await FlexiblePaymentSchedule.bulkCreate(schedules);
}

/**
 * GET /api/flexible-payment/upcoming
 * Get upcoming payments across all active plans
 */
router.get('/upcoming', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10 } = req.query;

    const upcomingPayments = await FlexiblePaymentSchedule.findAll({
      include: [
        {
          model: FlexiblePaymentPlan,
          as: 'plan',
          where: {
            tenant_id: userId,
            is_active: true
          },
          include: [
            {
              model: PaymentMethod,
              as: 'paymentMethod',
              attributes: ['id', 'payment_type', 'card_brand', 'card_last_four']
            }
          ]
        }
      ],
      where: {
        status: ['scheduled', 'processing']
      },
      order: [['scheduled_date', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: { upcomingPayments }
    });

  } catch (error) {
    console.error('❌ Error fetching upcoming payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming payments'
    });
  }
});

/**
 * PUT /api/flexible-payment/update/:id
 * Update flexible payment plan settings
 */
router.put('/update/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { paymentMethodId, autoPayEnabled, sendReminderEmail } = req.body;

    const plan = await FlexiblePaymentPlan.findOne({
      where: {
        id,
        tenant_id: userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    // Update plan settings
    await plan.update({
      payment_method_id: paymentMethodId || plan.payment_method_id,
      auto_pay_enabled: autoPayEnabled !== undefined ? autoPayEnabled : plan.auto_pay_enabled,
      send_reminder_email: sendReminderEmail !== undefined ? sendReminderEmail : plan.send_reminder_email,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Plan updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update plan'
    });
  }
});

/**
 * POST /api/flexible-payment/pause/:id
 * Pause a flexible payment plan
 */
router.post('/pause/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const plan = await FlexiblePaymentPlan.findOne({
      where: {
        id,
        tenant_id: userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    await plan.update({
      status: 'paused',
      is_active: false,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Plan paused successfully'
    });

  } catch (error) {
    console.error('❌ Error pausing plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause plan'
    });
  }
});

/**
 * POST /api/flexible-payment/resume/:id
 * Resume a paused flexible payment plan
 */
router.post('/resume/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const plan = await FlexiblePaymentPlan.findOne({
      where: {
        id,
        tenant_id: userId,
        status: 'paused'
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Paused plan not found'
      });
    }

    await plan.update({
      status: 'active',
      is_active: true,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Plan resumed successfully'
    });

  } catch (error) {
    console.error('❌ Error resuming plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume plan'
    });
  }
});

/**
 * DELETE /api/flexible-payment/cancel/:id
 * Cancel a flexible payment plan
 */
router.delete('/cancel/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const plan = await FlexiblePaymentPlan.findOne({
      where: {
        id,
        tenant_id: userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    // Cancel all scheduled payments
    await FlexiblePaymentSchedule.update(
      { status: 'cancelled' },
      {
        where: {
          plan_id: id,
          status: 'scheduled'
        }
      }
    );

    // Mark plan as cancelled
    await plan.update({
      status: 'cancelled',
      is_active: false,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Plan cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel plan'
    });
  }
});

/**
 * POST /api/flexible-payment/process-payment/:scheduleId
 * Manually process a scheduled payment
 */
router.post('/process-payment/:scheduleId', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scheduleId } = req.params;

    const schedule = await FlexiblePaymentSchedule.findOne({
      where: { id: scheduleId },
      include: [
        {
          model: FlexiblePaymentPlan,
          as: 'plan',
          where: { tenant_id: userId }
        }
      ]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled payment not found'
      });
    }

    if (schedule.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: `Payment already ${schedule.status}`
      });
    }

    // Update status to processing
    await schedule.update({ status: 'processing' });

    // TODO: Integrate with actual payment processing (mock for now)
    const payment = await RentPayment.create({
      lease_id: schedule.plan.lease_id,
      tenant_id: userId,
      payment_method_id: schedule.plan.payment_method_id,
      amount: schedule.amount,
      payment_date: new Date(),
      status: 'completed',
      payment_type: 'flexible_plan',
      transaction_id: `FLEX-${Date.now()}`,
      created_at: new Date()
    });

    // Update schedule with payment details
    await schedule.update({
      status: 'completed',
      payment_transaction_id: payment.id,
      processed_at: new Date()
    });

    // Update plan's next payment date
    const plan = schedule.plan;
    const nextScheduled = await FlexiblePaymentSchedule.findOne({
      where: {
        plan_id: plan.id,
        status: 'scheduled'
      },
      order: [['scheduled_date', 'ASC']]
    });

    if (nextScheduled) {
      await plan.update({ next_payment_date: nextScheduled.scheduled_date });
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        transactionId: payment.transaction_id
      }
    });

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
});

module.exports = router;
