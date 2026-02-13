const { sequelize } = require('../config/database');

// Import all model definitions
const UserModel = require('./User');
const PropertyModel = require('./Property');
const UnitModel = require('./Unit');
const LeaseModel = require('./Lease');
const PaymentMethodModel = require('./PaymentMethod');
const RentPaymentModel = require('./RentPayment');
const RecurringScheduleModel = require('./RecurringSchedule');

// Initialize models
const User = UserModel(sequelize);
const Property = PropertyModel(sequelize);
const Unit = UnitModel(sequelize);
const Lease = LeaseModel(sequelize);
const PaymentMethod = PaymentMethodModel(sequelize);
const RentPayment = RentPaymentModel(sequelize);
const RecurringSchedule = RecurringScheduleModel(sequelize);

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
  syncDatabase
};
