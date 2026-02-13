const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lease = sequelize.define('Lease', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'unit_id',
      references: {
        model: 'units',
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
    monthly_rent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'monthly_rent',
      validate: {
        min: {
          args: [0],
          msg: 'Monthly rent must be positive'
        }
      }
    },
    security_deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'security_deposit'
    },
    lease_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'lease_start_date'
    },
    lease_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'lease_end_date',
      validate: {
        isAfterStart(value) {
          if (value <= this.lease_start_date) {
            throw new Error('Lease end date must be after start date');
          }
        }
      }
    },
    rent_due_day: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'rent_due_day',
      validate: {
        min: 1,
        max: 31
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'terminated', 'pending'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'expired', 'terminated', 'pending']],
          msg: 'Status must be active, expired, terminated, or pending'
        }
      }
    },
    payment_grace_period_days: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'payment_grace_period_days'
    },
    late_fee_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'late_fee_amount'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'leases',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['tenant_id'] },
      { fields: ['unit_id'] },
      { fields: ['status'] },
      { fields: ['lease_start_date', 'lease_end_date'] },
      { fields: ['status', 'lease_end_date'] },
      {
        unique: true,
        fields: ['unit_id', 'tenant_id', 'lease_start_date'],
        name: 'leases_unit_id_tenant_id_lease_start_date_key'
      }
    ]
  });

  // Instance method to check if lease is active
  Lease.prototype.isActive = function() {
    const today = new Date();
    return this.status === 'active' &&
           new Date(this.lease_start_date) <= today &&
           new Date(this.lease_end_date) >= today;
  };

  // Instance method to get lease duration in months
  Lease.prototype.getDurationMonths = function() {
    const start = new Date(this.lease_start_date);
    const end = new Date(this.lease_end_date);
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
                   (end.getMonth() - start.getMonth());
    return months;
  };

  return Lease;
};
