const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkPayments() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, amount, total_amount, payment_month, payment_year,
             payment_status, payment_date, tenant_id
      FROM rent_payments
      ORDER BY payment_date DESC
      LIMIT 5
    `);

    console.log('\n=== Recent Payments ===\n');
    results.forEach(payment => {
      console.log(`Payment ID: ${payment.id}`);
      console.log(`Amount: $${payment.total_amount}`);
      console.log(`For: ${payment.payment_month}/${payment.payment_year}`);
      console.log(`Status: ${payment.payment_status}`);
      console.log(`Date: ${payment.payment_date}`);
      console.log('---');
    });

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPayments();
