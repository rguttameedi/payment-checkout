const { RentPayment } = require('./models');

async function checkPayments() {
  try {
    console.log('\n=== Recent Payments Debug ===\n');

    // Get all payments, ordered by most recent
    const payments = await RentPayment.findAll({
      where: { tenant_id: 2 }, // Assuming tenant ID 2 based on logs
      order: [['created_at', 'DESC']],
      limit: 10,
      raw: true
    });

    if (payments.length === 0) {
      console.log('No payments found for tenant ID 2');
      return;
    }

    console.log(`Found ${payments.length} payments:\n`);

    payments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`);
      console.log(`  ID: ${payment.id}`);
      console.log(`  Amount: $${payment.total_amount}`);
      console.log(`  For Month/Year: ${payment.payment_month}/${payment.payment_year}`);
      console.log(`  Status: ${payment.payment_status}`);
      console.log(`  Date: ${payment.payment_date}`);
      console.log(`  Created: ${payment.created_at}`);
      console.log('---');
    });

    // Calculate totals for current month
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const currentMonthPayments = payments.filter(p =>
      p.payment_month === currentMonth &&
      p.payment_year === currentYear &&
      ['completed', 'authorized', 'captured'].includes(p.payment_status)
    );

    const totalForCurrentMonth = currentMonthPayments.reduce((sum, p) => sum + parseFloat(p.total_amount), 0);

    console.log(`\n=== Current Month (${currentMonth}/${currentYear}) Summary ===`);
    console.log(`Payments for current month: ${currentMonthPayments.length}`);
    console.log(`Total paid this month: $${totalForCurrentMonth}`);
    console.log(`Expected remaining: $${2500 - totalForCurrentMonth}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPayments();
