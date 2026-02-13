const { sequelize } = require('../config/database');
const models = require('../models');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
};

async function addSampleData() {
  console.log('\n==============================================');
  console.log('   🏢 Adding Sample Property & Lease Data');
  console.log('==============================================\n');

  try {
    // Get tenant user
    const tenant = await models.User.findOne({ where: { email: 'john.doe@example.com' } });
    if (!tenant) {
      console.error('Tenant user not found!');
      process.exit(1);
    }
    log.success(`Found tenant: ${tenant.first_name} ${tenant.last_name}`);

    // Get admin user for property manager
    const admin = await models.User.findOne({ where: { email: 'admin@rentpay.com' } });

    // Create property
    log.step('Creating sample property...');
    const property = await models.Property.create({
      name: 'Sunset Apartments',
      address_line1: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      country: 'USA',
      property_manager_id: admin?.id || 1,
      total_units: 10,
      property_type: 'apartment',
      description: 'Modern apartment complex in downtown SF'
    });
    log.success(`Property created: ${property.name}`);

    // Create unit
    log.step('Creating sample unit...');
    const unit = await models.Unit.create({
      property_id: property.id,
      unit_number: '204',
      bedrooms: 2,
      bathrooms: 1,
      square_feet: 850,
      floor_number: 2,
      status: 'occupied',
      monthly_rent: 2500.00,
      security_deposit: 2500.00,
      description: '2BR/1BA with balcony and city view'
    });
    log.success(`Unit created: #${unit.unit_number}`);

    // Create lease
    log.step('Creating active lease for tenant...');
    const today = new Date();
    const leaseStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1); // Started 3 months ago
    const leaseEndDate = new Date(today.getFullYear() + 1, today.getMonth() - 3, 0); // Ends in 9 months

    const lease = await models.Lease.create({
      unit_id: unit.id,
      tenant_id: tenant.id,
      monthly_rent: 2500.00,
      security_deposit: 2500.00,
      lease_start_date: leaseStartDate,
      lease_end_date: leaseEndDate,
      rent_due_day: 1, // Rent due on 1st of each month
      status: 'active',
      payment_grace_period_days: 5,
      late_fee_amount: 50.00,
      notes: 'Standard 12-month lease'
    });
    log.success(`Lease created: #${lease.id}`);

    console.log('\n==============================================');
    log.success('Sample data added successfully!');
    console.log('==============================================\n');

    console.log('Property Details:');
    console.log(`  Name: ${property.name}`);
    console.log(`  Address: ${property.address_line1}, ${property.city}, ${property.state}`);
    console.log(`\nUnit Details:`);
    console.log(`  Unit: #${unit.unit_number}`);
    console.log(`  Type: ${unit.bedrooms}BR/${unit.bathrooms}BA`);
    console.log(`  Rent: $${unit.monthly_rent}/month`);
    console.log(`\nLease Details:`);
    console.log(`  Tenant: ${tenant.first_name} ${tenant.last_name}`);
    console.log(`  Start Date: ${leaseStartDate.toLocaleDateString()}`);
    console.log(`  End Date: ${leaseEndDate.toLocaleDateString()}`);
    console.log(`  Monthly Rent: $${lease.monthly_rent}`);
    console.log(`  Rent Due: Day ${lease.rent_due_day} of each month\n`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the script
addSampleData();
