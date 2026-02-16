const { DataTypes } = require('sequelize');

/**
 * Flexible Payment Schedule Model
 * Tracks individual payment instances for flexible payment plans
 */
module.exports = (sequelize) => {
  const FlexiblePaymentSchedule = sequelize.define('FlexiblePaymentSchedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to flexible payment plan'
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When this payment is scheduled'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Payment amount'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'processing', 'completed', 'failed', 'skipped', 'cancelled'),
      defaultValue: 'scheduled',
      comment: 'Payment status'
    },
    payment_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Reference to completed payment transaction'
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the payment was processed'
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for payment failure'
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of retry attempts'
    },
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether reminder email was sent'
    },
    reminder_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When reminder was sent'
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
    tableName: 'flexible_payment_schedules',
    timestamps: false
  });

  return FlexiblePaymentSchedule;
};
