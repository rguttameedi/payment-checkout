const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PaymentMethod = sequelize.define('PaymentMethod', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    payment_type: {
      type: DataTypes.ENUM('card', 'ach'),
      allowNull: false,
      field: 'payment_type',
      validate: {
        isIn: {
          args: [['card', 'ach']],
          msg: 'Payment type must be card or ach'
        }
      }
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    // Card fields (masked - NEVER store full card number)
    card_last_four: {
      type: DataTypes.STRING(4),
      allowNull: true,
      field: 'card_last_four'
    },
    card_brand: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'card_brand'
    },
    card_expiry_month: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: 'card_expiry_month'
    },
    card_expiry_year: {
      type: DataTypes.STRING(4),
      allowNull: true,
      field: 'card_expiry_year'
    },

    // ACH fields (masked - NEVER store full account number)
    account_last_four: {
      type: DataTypes.STRING(4),
      allowNull: true,
      field: 'account_last_four'
    },
    account_type: {
      type: DataTypes.ENUM('checking', 'savings'),
      allowNull: true,
      field: 'account_type'
    },
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'bank_name'
    },

    // Cybersource token (primary storage for payment processing)
    cybersource_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'cybersource_token'
    },

    // Billing address
    billing_address_line1: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'billing_address_line1'
    },
    billing_address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'billing_address_line2'
    },
    billing_city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'billing_city'
    },
    billing_state: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'billing_state'
    },
    billing_zip_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'billing_zip_code'
    },
    billing_country: {
      type: DataTypes.STRING(50),
      defaultValue: 'US',
      field: 'billing_country'
    },

    // Status tracking
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'deleted'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'expired', 'deleted']],
          msg: 'Status must be active, expired, or deleted'
        }
      }
    }
  }, {
    tableName: 'payment_methods',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['payment_type'] },
      { fields: ['user_id', 'is_default'] }
    ]
  });

  // Instance method to get display name
  PaymentMethod.prototype.getDisplayName = function() {
    if (this.nickname) {
      return this.nickname;
    }
    if (this.payment_type === 'card') {
      return `${this.card_brand || 'Card'} ending in ${this.card_last_four}`;
    }
    if (this.payment_type === 'ach') {
      return `${this.bank_name || 'Bank'} account ending in ${this.account_last_four}`;
    }
    return 'Payment Method';
  };

  // Instance method to check if card is expired
  PaymentMethod.prototype.isCardExpired = function() {
    if (this.payment_type !== 'card') {
      return false;
    }
    const now = new Date();
    const expYear = parseInt(this.card_expiry_year);
    const expMonth = parseInt(this.card_expiry_month);
    const expDate = new Date(expYear, expMonth - 1, 1);
    return now > expDate;
  };

  return PaymentMethod;
};
