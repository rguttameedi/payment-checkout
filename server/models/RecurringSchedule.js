const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RecurringSchedule = sequelize.define('RecurringSchedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lease_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'lease_id',
      references: {
        model: 'leases',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenant_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'payment_method_id',
      references: {
        model: 'payment_methods',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },

    // Schedule configuration
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    schedule_type: {
      type: DataTypes.ENUM('monthly', 'custom'),
      defaultValue: 'monthly',
      field: 'schedule_type'
    },
    payment_day: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'payment_day',
      validate: {
        min: 1,
        max: 31
      }
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date'
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date'
    },

    // Payment defaults
    default_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'default_amount',
      validate: {
        min: {
          args: [0],
          msg: 'Default amount must be positive'
        }
      }
    },

    // Tracking
    next_payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'next_payment_date'
    },
    last_payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'last_payment_date'
    },
    total_payments_made: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_payments_made'
    },
    failed_payment_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'failed_payment_attempts'
    },

    // Notifications
    send_reminder_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'send_reminder_email'
    },
    reminder_days_before: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      field: 'reminder_days_before'
    },
    send_receipt_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'send_receipt_email'
    }
  }, {
    tableName: 'recurring_payment_schedules',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['tenant_id'] },
      { fields: ['lease_id'] },
      { fields: ['next_payment_date'] },
      { fields: ['is_active'] },
      { fields: ['is_active', 'next_payment_date'] }
    ]
  });

  // Instance method to calculate next payment date
  RecurringSchedule.prototype.calculateNextPaymentDate = function(fromDate = null) {
    const baseDate = fromDate ? new Date(fromDate) : new Date(this.next_payment_date);
    const nextDate = new Date(baseDate);

    // Add one month
    nextDate.setMonth(nextDate.getMonth() + 1);

    // Set to payment day (handle months with fewer days)
    const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    const day = Math.min(this.payment_day, daysInMonth);
    nextDate.setDate(day);

    return nextDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  };

  // Instance method to check if payment is due today
  RecurringSchedule.prototype.isDueToday = function() {
    const today = new Date().toISOString().split('T')[0];
    return this.is_active && this.next_payment_date === today;
  };

  // Instance method to get reminder date
  RecurringSchedule.prototype.getReminderDate = function() {
    const paymentDate = new Date(this.next_payment_date);
    const reminderDate = new Date(paymentDate);
    reminderDate.setDate(paymentDate.getDate() - this.reminder_days_before);
    return reminderDate.toISOString().split('T')[0];
  };

  return RecurringSchedule;
};
