const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SplitPaymentInstallment = sequelize.define('SplitPaymentInstallment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    split_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    installment_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending'
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'split_payment_installments',
    timestamps: false
  });

  SplitPaymentInstallment.associate = (models) => {
    SplitPaymentInstallment.belongsTo(models.SplitPaymentPlan, { foreignKey: 'split_plan_id' });
    SplitPaymentInstallment.belongsTo(models.RentPayment, { foreignKey: 'payment_id' });
  };

  return SplitPaymentInstallment;
};
