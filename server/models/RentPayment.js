const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RentPayment = sequelize.define('RentPayment', {
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
      allowNull: true,
      field: 'payment_method_id',
      references: {
        model: 'payment_methods',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },

    // Payment details
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Amount must be positive'
        }
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    payment_type: {
      type: DataTypes.ENUM('card', 'ach'),
      allowNull: false,
      field: 'payment_type'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'authorized', 'captured', 'completed', 'failed', 'refunded', 'cancelled'),
      defaultValue: 'pending',
      field: 'payment_status'
    },

    // Cybersource integration
    cybersource_transaction_id: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
      field: 'cybersource_transaction_id'
    },
    cybersource_reference_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'cybersource_reference_code'
    },

    // Payment period tracking
    payment_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'payment_month',
      validate: {
        min: 1,
        max: 12
      }
    },
    payment_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'payment_year'
    },
    rent_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'rent_due_date'
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_date'
    },

    // Fees & charges
    late_fee_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'late_fee_amount'
    },
    processing_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'processing_fee'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },

    // Payment method info (stored for history)
    masked_payment_info: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'masked_payment_info'
    },

    // Recurring payment tracking
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_recurring'
    },
    recurring_schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'recurring_schedule_id'
    },

    // Metadata
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    receipt_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'receipt_url'
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'failure_reason'
    }
  }, {
    tableName: 'rent_payments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['lease_id'] },
      { fields: ['tenant_id'] },
      { fields: ['payment_status'] },
      { fields: ['cybersource_transaction_id'] },
      { fields: ['payment_year', 'payment_month'] },
      { fields: ['rent_due_date'] },
      { fields: ['is_recurring', 'recurring_schedule_id'] }
    ],
    hooks: {
      // Automatically calculate total_amount before creating
      beforeValidate: (payment) => {
        if (payment.amount !== undefined) {
          const lateFee = parseFloat(payment.late_fee_amount || 0);
          const processingFee = parseFloat(payment.processing_fee || 0);
          payment.total_amount = parseFloat(payment.amount) + lateFee + processingFee;
        }
      }
    }
  });

  // Instance method to check if payment is late
  RentPayment.prototype.isLate = function() {
    if (!this.payment_date || !this.rent_due_date) {
      return false;
    }
    return new Date(this.payment_date) > new Date(this.rent_due_date);
  };

  // Instance method to get payment period string
  RentPayment.prototype.getPaymentPeriod = function() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[this.payment_month - 1]} ${this.payment_year}`;
  };

  return RentPayment;
};
