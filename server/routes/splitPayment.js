const express = require('express');
const router = express.Router();
const { SplitPaymentPlan, SplitPaymentInstallment, PaymentMethod, Lease, RentPayment } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/split-payment/plans
 * Get user's active split payment plans
 */
router.get('/plans', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const plans = await SplitPaymentPlan.findAll({
      where: {
        tenant_id: userId,
        is_active: true
      },
      include: [
        {
          model: SplitPaymentInstallment,
          as: 'SplitPaymentInstallments'
        },
        {
          model: PaymentMethod,
          attributes: ['id', 'payment_type', 'card_brand', 'card_last_four', 'account_last_four']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('❌ Error fetching split payment plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch split payment plans'
    });
  }
});

/**
 * POST /api/split-payment/create
 * Create a new split payment plan
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      leaseId,
      paymentMethodId,
      totalAmount,
      numberOfSplits,
      installmentDates // Array of dates for each installment
    } = req.body;

    console.log('🔄 Creating split payment plan for user:', userId);

    // Validate inputs
    if (!numberOfSplits || numberOfSplits < 2 || numberOfSplits > 4) {
      return res.status(400).json({
        success: false,
        error: 'Number of splits must be between 2 and 4'
      });
    }

    if (!installmentDates || installmentDates.length !== numberOfSplits) {
      return res.status(400).json({
        success: false,
        error: 'Must provide dates for each installment'
      });
    }

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

    // Calculate amount per split
    const amountPerSplit = (parseFloat(totalAmount) / numberOfSplits).toFixed(2);

    // Get current month/year
    const now = new Date();
    const paymentMonth = now.getMonth() + 1;
    const paymentYear = now.getFullYear();

    // Check if plan already exists for this month
    const existingPlan = await SplitPaymentPlan.findOne({
      where: {
        tenant_id: userId,
        payment_month: paymentMonth,
        payment_year: paymentYear,
        is_active: true
      }
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        error: 'Split payment plan already exists for this month'
      });
    }

    // Check if regular payment already exists
    const existingPayment = await RentPayment.findOne({
      where: {
        tenant_id: userId,
        payment_month: paymentMonth,
        payment_year: paymentYear,
        payment_status: ['completed', 'authorized', 'captured']
      }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Payment already made for this month'
      });
    }

    // Create split payment plan
    const plan = await SplitPaymentPlan.create({
      tenant_id: userId,
      lease_id: leaseId,
      payment_method_id: paymentMethodId,
      total_amount: totalAmount,
      number_of_splits: numberOfSplits,
      amount_per_split: amountPerSplit,
      payment_month: paymentMonth,
      payment_year: paymentYear,
      is_active: true,
      created_at: now,
      updated_at: now
    });

    // Create installments
    const installments = [];
    for (let i = 0; i < numberOfSplits; i++) {
      const installment = await SplitPaymentInstallment.create({
        split_plan_id: plan.id,
        installment_number: i + 1,
        amount: amountPerSplit,
        scheduled_date: installmentDates[i],
        status: 'pending',
        created_at: now,
        updated_at: now
      });
      installments.push(installment);
    }

    console.log(`✅ Split payment plan created with ${numberOfSplits} installments`);

    res.json({
      success: true,
      message: `Split payment plan created with ${numberOfSplits} installments`,
      data: {
        planId: plan.id,
        totalAmount: plan.total_amount,
        amountPerSplit: plan.amount_per_split,
        installments: installments.map(inst => ({
          number: inst.installment_number,
          amount: inst.amount,
          date: inst.scheduled_date,
          status: inst.status
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error creating split payment plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create split payment plan'
    });
  }
});

/**
 * POST /api/split-payment/process-installment
 * Process a single installment payment
 */
router.post('/process-installment', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { installmentId } = req.body;

    console.log('💳 Processing installment payment:', installmentId);

    // Get installment with plan details
    const installment = await SplitPaymentInstallment.findOne({
      where: { id: installmentId },
      include: [
        {
          model: SplitPaymentPlan,
          include: [{ model: PaymentMethod }]
        }
      ]
    });

    if (!installment) {
      return res.status(404).json({
        success: false,
        error: 'Installment not found'
      });
    }

    if (installment.SplitPaymentPlan.tenant_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (installment.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Installment already paid'
      });
    }

    // Process payment (mock implementation)
    // In production, this would integrate with payment gateway
    const mockTransactionId = `SPLIT_${Date.now()}`;

    // Create rent payment record
    const payment = await RentPayment.create({
      lease_id: installment.SplitPaymentPlan.lease_id,
      tenant_id: userId,
      payment_method_id: installment.SplitPaymentPlan.payment_method_id,
      amount: installment.amount,
      currency: 'USD',
      payment_type: installment.SplitPaymentPlan.PaymentMethod.payment_type,
      payment_status: 'completed',
      cybersource_transaction_id: mockTransactionId,
      payment_month: installment.SplitPaymentPlan.payment_month,
      payment_year: installment.SplitPaymentPlan.payment_year,
      payment_date: new Date(),
      total_amount: installment.amount,
      masked_payment_info: `Installment ${installment.installment_number} of ${installment.SplitPaymentPlan.number_of_splits}`,
      notes: `Split payment installment ${installment.installment_number}`,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Update installment status
    await installment.update({
      status: 'completed',
      payment_id: payment.id,
      processed_at: new Date()
    });

    // Check if all installments are completed
    const allInstallments = await SplitPaymentInstallment.findAll({
      where: { split_plan_id: installment.split_plan_id }
    });

    const allCompleted = allInstallments.every(inst => inst.status === 'completed');

    if (allCompleted) {
      await SplitPaymentPlan.update(
        { is_active: false },
        { where: { id: installment.split_plan_id } }
      );
      console.log('✅ All installments completed - plan marked as inactive');
    }

    res.json({
      success: true,
      message: 'Installment payment processed successfully',
      data: {
        transactionId: mockTransactionId,
        paymentId: payment.id,
        installmentNumber: installment.installment_number,
        amount: installment.amount,
        allInstallmentsCompleted: allCompleted
      }
    });

  } catch (error) {
    console.error('❌ Error processing installment payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process installment payment'
    });
  }
});

/**
 * GET /api/split-payment/upcoming
 * Get upcoming installments
 */
router.get('/upcoming', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const upcomingInstallments = await SplitPaymentInstallment.findAll({
      where: {
        status: 'pending',
        scheduled_date: {
          [require('sequelize').Op.gte]: today
        }
      },
      include: [
        {
          model: SplitPaymentPlan,
          where: { tenant_id: userId, is_active: true },
          include: [{ model: PaymentMethod }]
        }
      ],
      order: [['scheduled_date', 'ASC']],
      limit: 10
    });

    res.json({
      success: true,
      data: upcomingInstallments
    });

  } catch (error) {
    console.error('❌ Error fetching upcoming installments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming installments'
    });
  }
});

/**
 * DELETE /api/split-payment/cancel/:planId
 * Cancel a split payment plan (only if no installments are paid)
 */
router.delete('/cancel/:planId', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.params;

    const plan = await SplitPaymentPlan.findOne({
      where: {
        id: planId,
        tenant_id: userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    // Check if any installments are already paid
    const paidInstallments = await SplitPaymentInstallment.count({
      where: {
        split_plan_id: planId,
        status: 'completed'
      }
    });

    if (paidInstallments > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel plan with completed installments'
      });
    }

    // Cancel plan
    await plan.update({ is_active: false });

    // Cancel all pending installments
    await SplitPaymentInstallment.update(
      { status: 'cancelled' },
      {
        where: {
          split_plan_id: planId,
          status: 'pending'
        }
      }
    );

    res.json({
      success: true,
      message: 'Split payment plan cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling split payment plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel split payment plan'
    });
  }
});

module.exports = router;
