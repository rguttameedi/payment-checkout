const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoommateSplitPlan = sequelize.define('RoommateSplitPlan', {
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
    created_by_tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by_tenant_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
      validate: {
        min: {
          args: [0],
          msg: 'Total amount must be positive'
        }
      }
    },
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
    number_of_roommates: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'number_of_roommates',
      validate: {
        min: 2,
        max: 6
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
      defaultValue: 'pending',
      field: 'status'
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'due_date'
    }
  }, {
    tableName: 'roommate_split_plans',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['lease_id'] },
      { fields: ['created_by_tenant_id'] },
      { fields: ['is_active'] },
      { fields: ['status'] },
      { fields: ['payment_year', 'payment_month'] }
    ]
  });

  // Instance method to check if all shares are paid
  RoommateSplitPlan.prototype.isFullyPaid = function() {
    // This will be checked against RoommateShares
    return this.status === 'completed';
  };

  // Instance method to get total paid amount
  RoommateSplitPlan.prototype.getTotalPaid = async function() {
    const { RoommateShare } = require('./index');
    const shares = await RoommateShare.findAll({
      where: {
        split_plan_id: this.id,
        status: 'paid'
      }
    });
    return shares.reduce((sum, share) => sum + parseFloat(share.share_amount), 0);
  };

  return RoommateSplitPlan;
};
