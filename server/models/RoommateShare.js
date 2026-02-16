const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoommateShare = sequelize.define('RoommateShare', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    split_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'split_plan_id',
      references: {
        model: 'roommate_split_plans',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable for guest roommates without accounts
      field: 'tenant_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    roommate_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'roommate_name'
    },
    roommate_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'roommate_email',
      validate: {
        isEmail: true
      }
    },
    share_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'share_amount',
      validate: {
        min: {
          args: [0],
          msg: 'Share amount must be positive'
        }
      }
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Will be set when they pay
      field: 'payment_method_id',
      references: {
        model: 'payment_methods',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled'),
      defaultValue: 'pending',
      field: 'status'
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'payment_id',
      references: {
        model: 'payments',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at'
    },
    reminder_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reminder_sent_at'
    },
    reminder_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'reminder_count'
    }
  }, {
    tableName: 'roommate_shares',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['split_plan_id'] },
      { fields: ['tenant_id'] },
      { fields: ['roommate_email'] },
      { fields: ['status'] },
      { fields: ['split_plan_id', 'status'] }
    ]
  });

  // Instance method to check if reminder should be sent
  RoommateShare.prototype.shouldSendReminder = function(maxReminders = 3) {
    return this.status === 'pending' && this.reminder_count < maxReminders;
  };

  // Instance method to mark as paid
  RoommateShare.prototype.markAsPaid = async function(paymentId, paymentMethodId) {
    this.status = 'paid';
    this.payment_id = paymentId;
    this.payment_method_id = paymentMethodId;
    this.paid_at = new Date();
    await this.save();
  };

  return RoommateShare;
};
