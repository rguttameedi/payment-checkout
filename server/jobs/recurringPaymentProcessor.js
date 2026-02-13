const cron = require('node-cron');
const { RecurringPaymentSchedule, Lease, User, PaymentMethod } = require('../models');
const { processRecurringPayment } = require('../controllers/paymentController');
const { Op } = require('sequelize');

/**
 * Recurring Payment Processor
 * Runs daily to process scheduled automatic rent payments
 */

class RecurringPaymentProcessor {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Start the recurring payment processor
   * Runs daily at 2:00 AM
   */
  start() {
    console.log('📅 Starting Recurring Payment Processor...');

    // Run every day at 2:00 AM
    this.cronJob = cron.schedule('0 2 * * *', async () => {
      await this.processScheduledPayments();
    });

    console.log('✅ Recurring Payment Processor started (runs daily at 2:00 AM)');

    // Also run immediately on startup (optional - comment out for production)
    // this.processScheduledPayments();
  }

  /**
   * Stop the processor
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏹️  Recurring Payment Processor stopped');
    }
  }

  /**
   * Process all scheduled payments for today
   */
  async processScheduledPayments() {
    if (this.isRunning) {
      console.log('⚠️  Recurring payment processor already running, skipping...');
      return;
    }

    this.isRunning = true;
    const today = new Date();
    const currentDay = today.getDate();

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log(`🔄 Processing Recurring Payments - ${today.toISOString()}`);
    console.log('═══════════════════════════════════════════════');

    try {
      // Find all active schedules that should run today
      const schedules = await RecurringPaymentSchedule.findAll({
        where: {
          status: 'active',
          payment_day: currentDay,
          // Ensure we haven't processed this month already
          [Op.or]: [
            { last_payment_date: null },
            {
              last_payment_date: {
                [Op.lt]: new Date(today.getFullYear(), today.getMonth(), 1)
              }
            }
          ]
        },
        include: [
          {
            model: Lease,
            as: 'lease',
            where: { status: 'active' },
            include: [{ model: User, as: 'tenant' }]
          },
          { model: PaymentMethod, as: 'payment_method' }
        ]
      });

      console.log(`📋 Found ${schedules.length} scheduled payments for day ${currentDay}`);

      if (schedules.length === 0) {
        console.log('✅ No payments to process today');
        this.isRunning = false;
        return;
      }

      let successCount = 0;
      let failureCount = 0;
      const results = [];

      // Process each schedule
      for (const schedule of schedules) {
        console.log('');
        console.log(`💳 Processing payment for ${schedule.lease.tenant.first_name} ${schedule.lease.tenant.last_name}`);
        console.log(`   Lease ID: ${schedule.lease_id}, Amount: $${schedule.lease.monthly_rent}`);

        // Send reminder email if enabled (before processing)
        if (schedule.send_reminder_email) {
          // TODO: Implement email reminder
          console.log(`   📧 Reminder email would be sent to ${schedule.lease.tenant.email}`);
        }

        // Process the payment
        const result = await processRecurringPayment(schedule.id);

        if (result.success) {
          successCount++;
          console.log(`   ✅ Payment successful - Transaction ID: ${result.transaction_id}`);

          results.push({
            schedule_id: schedule.id,
            tenant: `${schedule.lease.tenant.first_name} ${schedule.lease.tenant.last_name}`,
            amount: schedule.lease.monthly_rent,
            status: 'success',
            transaction_id: result.transaction_id
          });

          // Send success notification email
          // TODO: Implement success email
        } else {
          failureCount++;
          console.log(`   ❌ Payment failed - ${result.message}`);

          results.push({
            schedule_id: schedule.id,
            tenant: `${schedule.lease.tenant.first_name} ${schedule.lease.tenant.last_name}`,
            amount: schedule.lease.monthly_rent,
            status: 'failed',
            error: result.message
          });

          // Send failure notification email
          // TODO: Implement failure email with retry info
        }

        // Add small delay between payments to avoid rate limiting
        await this.sleep(2000); // 2 second delay
      }

      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('📊 Processing Summary:');
      console.log(`   Total Scheduled: ${schedules.length}`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${failureCount}`);
      console.log('═══════════════════════════════════════════════');
      console.log('');

      // Log results to database or file for audit trail
      await this.logProcessingResults(today, results);

    } catch (error) {
      console.error('❌ Error processing recurring payments:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger payment processing (for testing)
   */
  async processNow() {
    console.log('🔧 Manual trigger: Processing recurring payments...');
    await this.processScheduledPayments();
  }

  /**
   * Process a specific schedule (for retry)
   */
  async processSchedule(scheduleId) {
    console.log(`🔄 Processing specific schedule: ${scheduleId}`);
    const result = await processRecurringPayment(scheduleId);
    return result;
  }

  /**
   * Log processing results
   */
  async logProcessingResults(date, results) {
    // TODO: Implement logging to database or file
    // Could create a ProcessingLog model to track daily runs

    console.log('📝 Logging results for audit trail...');
    // For now, just log to console
    // In production, save to database or monitoring service
  }

  /**
   * Helper: Sleep/delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get processor status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.cronJob ? true : false,
      schedule: '0 2 * * * (Daily at 2:00 AM)'
    };
  }
}

// Export singleton instance
const processor = new RecurringPaymentProcessor();

module.exports = processor;
