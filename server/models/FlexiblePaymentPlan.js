const { DataTypes } = require('sequelize');

/**
 * Flexible Payment Plan Model
 * Allows tenants to set up weekly or biweekly payment schedules
 */
module.exports = (sequelize) => {
  const FlexiblePaymentPlan = sequelize.define('FlexiblePaymentPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lease_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to lease'
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Tenant who created the plan'
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Payment method to use'
    },
    plan_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'User-friendly name for the plan'
    },
    frequency: {
      type: DataTypes.ENUM('weekly', 'biweekly'),
      allowNull: false,
      comment: 'Payment frequency'
    },
    payment_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Amount per payment'
    },
    total_monthly_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Total monthly rent amount'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the plan starts'
    },
    next_payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date of next scheduled payment'
    },
    payment_day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Day of week for weekly payments (0=Sunday, 6=Saturday)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the plan is currently active'
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'cancelled', 'completed'),
      defaultValue: 'active',
      comment: 'Current status of the plan'
    },
    auto_pay_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Automatically process payments'
    },
    send_reminder_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Send email reminders before payment'
    },
    reminder_days_before: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      comment: 'Days before payment to send reminder'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'flexible_payment_plans',
    timestamps: false
  });

  return FlexiblePaymentPlan;
};
