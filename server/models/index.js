const { sequelize } = require('../config/database');

// Import all model definitions
const UserModel = require('./User');
const PropertyModel = require('./Property');
const UnitModel = require('./Unit');
const LeaseModel = require('./Lease');
const PaymentMethodModel = require('./PaymentMethod');
const RentPaymentModel = require('./RentPayment');
const RecurringScheduleModel = require('./RecurringSchedule');
const SplitPaymentPlanModel = require('./SplitPaymentPlan');
const SplitPaymentInstallmentModel = require('./SplitPaymentInstallment');
const RoommateSplitPlanModel = require('./RoommateSplitPlan');
const RoommateShareModel = require('./RoommateShare');
const FlexiblePaymentPlanModel = require('./FlexiblePaymentPlan');
const FlexiblePaymentScheduleModel = require('./FlexiblePaymentSchedule');
const UserIdentityVerificationModel = require('./UserIdentityVerification');

// Initialize models
const User = UserModel(sequelize);
const Property = PropertyModel(sequelize);
const Unit = UnitModel(sequelize);
const Lease = LeaseModel(sequelize);
const PaymentMethod = PaymentMethodModel(sequelize);
const RentPayment = RentPaymentModel(sequelize);
const RecurringSchedule = RecurringScheduleModel(sequelize);
const SplitPaymentPlan = SplitPaymentPlanModel(sequelize);
const SplitPaymentInstallment = SplitPaymentInstallmentModel(sequelize);
const RoommateSplitPlan = RoommateSplitPlanModel(sequelize);
const RoommateShare = RoommateShareModel(sequelize);
const FlexiblePaymentPlan = FlexiblePaymentPlanModel(sequelize);
const FlexiblePaymentSchedule = FlexiblePaymentScheduleModel(sequelize);
const UserIdentityVerification = UserIdentityVerificationModel(sequelize);

// ============================================
// DEFINE MODEL ASSOCIATIONS (RELATIONSHIPS)
// ============================================

// User associations
User.hasMany(Property, {
  foreignKey: 'property_manager_id',
  as: 'managedProperties'
});

User.hasMany(Lease, {
  foreignKey: 'tenant_id',
  as: 'leases'
});

User.hasMany(PaymentMethod, {
  foreignKey: 'user_id',
  as: 'paymentMethods'
});

User.hasMany(RentPayment, {
  foreignKey: 'tenant_id',
  as: 'payments'
});

User.hasMany(RecurringSchedule, {
  foreignKey: 'tenant_id',
  as: 'recurringSchedules'
});

User.hasOne(UserIdentityVerification, {
  foreignKey: 'user_id',
  as: 'identityVerification'
});

// Property associations
Property.belongsTo(User, {
  foreignKey: 'property_manager_id',
  as: 'propertyManager'
});

Property.hasMany(Unit, {
  foreignKey: 'property_id',
  as: 'units'
});

// Unit associations
Unit.belongsTo(Property, {
  foreignKey: 'property_id',
  as: 'property'
});

Unit.hasMany(Lease, {
  foreignKey: 'unit_id',
  as: 'leases'
});

// Lease associations
Lease.belongsTo(Unit, {
  foreignKey: 'unit_id',
  as: 'unit'
});

Lease.belongsTo(User, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

Lease.hasMany(RentPayment, {
  foreignKey: 'lease_id',
  as: 'payments'
});

Lease.hasOne(RecurringSchedule, {
  foreignKey: 'lease_id',
  as: 'recurringSchedule'
});

// PaymentMethod associations
PaymentMethod.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

PaymentMethod.hasMany(RentPayment, {
  foreignKey: 'payment_method_id',
  as: 'payments'
});

PaymentMethod.hasMany(RecurringSchedule, {
  foreignKey: 'payment_method_id',
  as: 'recurringSchedules'
});

// RentPayment associations
RentPayment.belongsTo(Lease, {
  foreignKey: 'lease_id',
  as: 'lease'
});

RentPayment.belongsTo(User, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

RentPayment.belongsTo(PaymentMethod, {
  foreignKey: 'payment_method_id',
  as: 'paymentMethod'
});

// RecurringSchedule associations
RecurringSchedule.belongsTo(Lease, {
  foreignKey: 'lease_id',
  as: 'lease'
});

RecurringSchedule.belongsTo(User, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

RecurringSchedule.belongsTo(PaymentMethod, {
  foreignKey: 'payment_method_id',
  as: 'paymentMethod'
});

// SplitPaymentPlan associations
SplitPaymentPlan.belongsTo(User, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

SplitPaymentPlan.belongsTo(Lease, {
  foreignKey: 'lease_id',
  as: 'lease'
});

SplitPaymentPlan.belongsTo(PaymentMethod, {
  foreignKey: 'payment_method_id',
  as: 'paymentMethod'
});

SplitPaymentPlan.hasMany(SplitPaymentInstallment, {
  foreignKey: 'split_plan_id',
  as: 'installments'
});

// SplitPaymentInstallment associations
SplitPaymentInstallment.belongsTo(SplitPaymentPlan, {
  foreignKey: 'split_plan_id',
  as: 'splitPlan'
});

SplitPaymentInstallment.belongsTo(RentPayment, {
  foreignKey: 'payment_id',
  as: 'payment'
});

// RoommateSplitPlan associations
RoommateSplitPlan.belongsTo(Lease, {
  foreignKey: 'lease_id',
  as: 'lease'
});

RoommateSplitPlan.belongsTo(User, {
  foreignKey: 'created_by_tenant_id',
  as: 'createdBy'
});

RoommateSplitPlan.hasMany(RoommateShare, {
  foreignKey: 'split_plan_id',
  as: 'shares'
});

// RoommateShare associations
RoommateShare.belongsTo(RoommateSplitPlan, {
  foreignKey: 'split_plan_id',
  as: 'splitPlan'
});

RoommateShare.belongsTo(User, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

RoommateShare.belongsTo(PaymentMethod, {
  foreignKey: 'payment_method_id',
  as: 'paymentMethod'
});

RoommateShare.belongsTo(RentPayment, {
  foreignKey: 'payment_id',
  as: 'payment'
});

// FlexiblePaymentPlan associations
FlexiblePaymentPlan.belongsTo(Lease, {
  foreignKey: 'lease_id',
  as: 'lease'
});

FlexiblePaymentPlan.belongsTo(User, {
  foreignKey: 'tenant_id',
  as: 'tenant'
});

FlexiblePaymentPlan.belongsTo(PaymentMethod, {
  foreignKey: 'payment_method_id',
  as: 'paymentMethod'
});

FlexiblePaymentPlan.hasMany(FlexiblePaymentSchedule, {
  foreignKey: 'plan_id',
  as: 'schedules'
});

// FlexiblePaymentSchedule associations
FlexiblePaymentSchedule.belongsTo(FlexiblePaymentPlan, {
  foreignKey: 'plan_id',
  as: 'plan'
});

FlexiblePaymentSchedule.belongsTo(RentPayment, {
  foreignKey: 'payment_transaction_id',
  as: 'transaction'
});

// UserIdentityVerification associations
UserIdentityVerification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// ============================================
// SYNC DATABASE (Development only)
// ============================================

const syncDatabase = async () => {
  try {
    // alter: true will update existing tables to match models
    // force: true would DROP and recreate tables (DON'T use in production!)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Failed to sync database:', error.message);
    throw error;
  }
};

// ============================================
// EXPORT ALL MODELS
// ============================================

module.exports = {
  sequelize,
  User,
  Property,
  Unit,
  Lease,
  PaymentMethod,
  RentPayment,
  RecurringSchedule,
  SplitPaymentPlan,
  SplitPaymentInstallment,
  RoommateSplitPlan,
  RoommateShare,
  FlexiblePaymentPlan,
  FlexiblePaymentSchedule,
  UserIdentityVerification,
  Payment: RentPayment, // Alias for service compatibility
  syncDatabase
};
