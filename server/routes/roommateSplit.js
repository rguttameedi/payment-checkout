const express = require('express');
const router = express.Router();
const { RoommateSplitPlan, RoommateShare, Lease, User, PaymentMethod, RentPayment } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/roommate-split/plans
 * Get all active roommate split plans for the user
 */
router.get('/plans', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get plans where user is either creator or a participant
    const plans = await RoommateSplitPlan.findAll({
      where: {
        is_active: true
      },
      include: [
        {
          model: Lease,
          as: 'lease',
          where: {
            tenant_id: userId
          }
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: RoommateShare,
          as: 'shares',
          include: [
            {
              model: User,
              as: 'tenant',
              attributes: ['id', 'full_name', 'email'],
              required: false
            },
            {
              model: RentPayment,
              as: 'payment',
              required: false
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Also get plans where user is a share participant
    const shareParticipations = await RoommateShare.findAll({
      where: {
        tenant_id: userId
      },
      include: [
        {
          model: RoommateSplitPlan,
          as: 'splitPlan',
          where: {
            is_active: true
          },
          include: [
            {
              model: Lease,
              as: 'lease'
            },
            {
              model: User,
              as: 'createdBy',
              attributes: ['id', 'full_name', 'email']
            },
            {
              model: RoommateShare,
              as: 'shares',
              include: [
                {
                  model: User,
                  as: 'tenant',
                  attributes: ['id', 'full_name', 'email'],
                  required: false
                }
              ]
            }
          ]
        }
      ]
    });

    // Combine and deduplicate plans
    const allPlans = [...plans];
    shareParticipations.forEach(share => {
      if (!allPlans.find(p => p.id === share.splitPlan.id)) {
        allPlans.push(share.splitPlan);
      }
    });

    res.json({
      success: true,
      data: allPlans
    });

  } catch (error) {
    console.error('❌ Error fetching roommate split plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roommate split plans'
    });
  }
});

/**
 * POST /api/roommate-split/create
 * Create a new roommate split plan
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      leaseId,
      totalAmount,
      paymentMonth,
      paymentYear,
      dueDate,
      roommates // Array of { name, email, shareAmount }
    } = req.body;

    console.log('🔄 Creating roommate split plan for user:', userId);

    // Validate lease belongs to user
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

    // Validate roommates array
    if (!Array.isArray(roommates) || roommates.length < 1 || roommates.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Must have between 1 and 5 roommates'
      });
    }

    // Validate total shares equal total amount
    const totalShares = roommates.reduce((sum, r) => sum + parseFloat(r.shareAmount), 0);
    if (Math.abs(totalShares - parseFloat(totalAmount)) > 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Sum of shares must equal total amount'
      });
    }

    // Create the split plan
    const splitPlan = await RoommateSplitPlan.create({
      lease_id: leaseId,
      created_by_tenant_id: userId,
      total_amount: totalAmount,
      payment_month: paymentMonth,
      payment_year: paymentYear,
      number_of_roommates: roommates.length + 1, // +1 for the creator
      due_date: dueDate,
      is_active: true,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create shares for each roommate
    const sharePromises = roommates.map(roommate => {
      return RoommateShare.create({
        split_plan_id: splitPlan.id,
        tenant_id: null, // Will be filled if they have an account
        roommate_name: roommate.name,
        roommate_email: roommate.email,
        share_amount: roommate.shareAmount,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    await Promise.all(sharePromises);

    console.log('✅ Roommate split plan created:', splitPlan.id);

    // Fetch complete plan with shares
    const completePlan = await RoommateSplitPlan.findOne({
      where: { id: splitPlan.id },
      include: [
        {
          model: RoommateShare,
          as: 'shares'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Roommate split plan created successfully',
      data: completePlan
    });

  } catch (error) {
    console.error('❌ Error creating roommate split plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create roommate split plan'
    });
  }
});

/**
 * POST /api/roommate-split/pay-share
 * Pay a roommate share
 */
router.post('/pay-share', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shareId, paymentMethodId } = req.body;

    console.log('🔄 Processing roommate share payment:', shareId);

    // Find the share
    const share = await RoommateShare.findOne({
      where: { id: shareId },
      include: [
        {
          model: RoommateSplitPlan,
          as: 'splitPlan',
          include: [
            {
              model: Lease,
              as: 'lease'
            }
          ]
        }
      ]
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share not found'
      });
    }

    if (share.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Share already paid'
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

    // Create payment record
    const payment = await RentPayment.create({
      lease_id: share.splitPlan.lease_id,
      tenant_id: userId,
      payment_method_id: paymentMethodId,
      amount: share.share_amount,
      payment_type: 'rent',
      status: 'completed',
      payment_date: new Date(),
      payment_month: share.splitPlan.payment_month,
      payment_year: share.splitPlan.payment_year,
      notes: `Roommate share payment for split plan #${share.split_plan_id}`,
      created_at: new Date()
    });

    // Update share status
    await share.update({
      status: 'paid',
      payment_id: payment.id,
      payment_method_id: paymentMethodId,
      paid_at: new Date(),
      updated_at: new Date()
    });

    // Check if all shares are paid
    const allShares = await RoommateShare.findAll({
      where: { split_plan_id: share.split_plan_id }
    });

    const allPaid = allShares.every(s => s.status === 'paid');

    if (allPaid) {
      await share.splitPlan.update({
        status: 'completed',
        updated_at: new Date()
      });
      console.log('✅ All shares paid! Split plan completed:', share.split_plan_id);
    }

    console.log('✅ Roommate share payment processed:', payment.id);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: payment.id,
        shareId: share.id,
        allPaid: allPaid
      }
    });

  } catch (error) {
    console.error('❌ Error processing roommate share payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
});

/**
 * POST /api/roommate-split/send-reminder
 * Send payment reminder to a roommate
 */
router.post('/send-reminder', authenticate, async (req, res) => {
  try {
    const { shareId } = req.body;

    const share = await RoommateShare.findOne({
      where: { id: shareId },
      include: [
        {
          model: RoommateSplitPlan,
          as: 'splitPlan'
        }
      ]
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share not found'
      });
    }

    if (share.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only send reminders for pending shares'
      });
    }

    // Update reminder tracking
    await share.update({
      reminder_sent_at: new Date(),
      reminder_count: share.reminder_count + 1,
      updated_at: new Date()
    });

    // TODO: Implement actual email sending logic
    console.log(`📧 Reminder sent to ${share.roommate_email} for share #${share.id}`);

    res.json({
      success: true,
      message: 'Reminder sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending reminder:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send reminder'
    });
  }
});

/**
 * DELETE /api/roommate-split/cancel/:id
 * Cancel a roommate split plan
 */
router.delete('/cancel/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const planId = req.params.id;

    const plan = await RoommateSplitPlan.findOne({
      where: {
        id: planId,
        created_by_tenant_id: userId
      },
      include: [
        {
          model: RoommateShare,
          as: 'shares'
        }
      ]
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found or you do not have permission to cancel it'
      });
    }

    // Check if any shares are already paid
    const paidShares = plan.shares.filter(s => s.status === 'paid');
    if (paidShares.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel plan with paid shares'
      });
    }

    // Update plan and shares status
    await plan.update({
      is_active: false,
      status: 'cancelled',
      updated_at: new Date()
    });

    await RoommateShare.update(
      { status: 'cancelled', updated_at: new Date() },
      { where: { split_plan_id: planId } }
    );

    console.log('✅ Roommate split plan cancelled:', planId);

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
 * GET /api/roommate-split/plan/:id
 * Get details of a specific plan
 */
router.get('/plan/:id', authenticate, async (req, res) => {
  try {
    const planId = req.params.id;

    const plan = await RoommateSplitPlan.findOne({
      where: { id: planId },
      include: [
        {
          model: Lease,
          as: 'lease',
          include: [
            {
              model: User,
              as: 'tenant',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: RoommateShare,
          as: 'shares',
          include: [
            {
              model: User,
              as: 'tenant',
              attributes: ['id', 'full_name', 'email'],
              required: false
            },
            {
              model: RentPayment,
              as: 'payment',
              required: false
            }
          ]
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
      data: plan
    });

  } catch (error) {
    console.error('❌ Error fetching plan details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan details'
    });
  }
});

module.exports = router;
