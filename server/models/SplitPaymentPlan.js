const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SplitPaymentPlan = sequelize.define('SplitPaymentPlan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lease_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    number_of_splits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2,
        max: 4
      }
    },
    amount_per_split: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    payment_month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: 'split_payment_plans',
    timestamps: false
  });

  SplitPaymentPlan.associate = (models) => {
    SplitPaymentPlan.belongsTo(models.User, { foreignKey: 'tenant_id' });
    SplitPaymentPlan.belongsTo(models.Lease, { foreignKey: 'lease_id' });
    SplitPaymentPlan.belongsTo(models.PaymentMethod, { foreignKey: 'payment_method_id' });
    SplitPaymentPlan.hasMany(models.SplitPaymentInstallment, { foreignKey: 'split_plan_id' });
  };

  return SplitPaymentPlan;
};
