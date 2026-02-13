import { jsPDF } from 'jspdf';

/**
 * Generate and download a PDF receipt for a payment
 * @param {Object} payment - Payment object with all details
 * @param {Object} leaseInfo - Optional lease information
 */
export const generatePaymentReceipt = (payment, leaseInfo = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get month name
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  };

  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('PAYMENT RECEIPT', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Rent Payment Application', pageWidth / 2, yPosition, { align: 'center' });

  // Draw horizontal line
  yPosition += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);

  // Payment Status Badge
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');

  const statusColors = {
    completed: [34, 197, 94],
    pending: [234, 179, 8],
    failed: [239, 68, 68],
    processing: [59, 130, 246],
    refunded: [156, 163, 175]
  };

  const statusColor = statusColors[payment.payment_status] || [156, 163, 175];
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${(payment.payment_status || 'N/A').toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Payment Details Section
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Information', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  // Payment ID
  doc.setFont(undefined, 'bold');
  doc.text('Payment ID:', 25, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(`#${payment.id}`, 80, yPosition);

  yPosition += 8;

  // Transaction ID
  doc.setFont(undefined, 'bold');
  doc.text('Transaction ID:', 25, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(payment.transaction_id || 'N/A', 80, yPosition);

  yPosition += 8;

  // Payment Date
  doc.setFont(undefined, 'bold');
  doc.text('Payment Date:', 25, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(formatDate(payment.payment_date), 80, yPosition);

  yPosition += 8;

  // Payment Period
  if (payment.payment_month && payment.payment_year) {
    doc.setFont(undefined, 'bold');
    doc.text('Payment For:', 25, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(`${getMonthName(payment.payment_month)} ${payment.payment_year}`, 80, yPosition);
    yPosition += 8;
  }

  // Amount Section
  yPosition += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Amount Details', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  // Base Amount
  if (payment.base_amount) {
    doc.setFont(undefined, 'bold');
    doc.text('Base Amount:', 25, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(formatCurrency(payment.base_amount), 80, yPosition);
    yPosition += 8;
  }

  // Fees
  if (payment.convenience_fee && parseFloat(payment.convenience_fee) > 0) {
    doc.setFont(undefined, 'bold');
    doc.text('Convenience Fee:', 25, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(formatCurrency(payment.convenience_fee), 80, yPosition);
    yPosition += 8;
  }

  // Total Amount (highlighted)
  yPosition += 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 6, pageWidth - 40, 10, 'F');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total Amount:', 25, yPosition);
  doc.text(formatCurrency(payment.total_amount), pageWidth - 25, yPosition, { align: 'right' });

  // Payment Method Section
  if (payment.payment_method || payment.paymentMethod) {
    const paymentMethod = payment.payment_method || payment.paymentMethod;

    yPosition += 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Method', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    // Payment Type
    doc.setFont(undefined, 'bold');
    doc.text('Type:', 25, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(paymentMethod.payment_type === 'card' ? 'Credit/Debit Card' : 'Bank Account (ACH)', 80, yPosition);
    yPosition += 8;

    // Card/Account Details
    if (paymentMethod.payment_type === 'card') {
      if (paymentMethod.card_brand) {
        doc.setFont(undefined, 'bold');
        doc.text('Card Brand:', 25, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(paymentMethod.card_brand, 80, yPosition);
        yPosition += 8;
      }

      if (paymentMethod.card_last_four) {
        doc.setFont(undefined, 'bold');
        doc.text('Card Number:', 25, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(`**** **** **** ${paymentMethod.card_last_four}`, 80, yPosition);
        yPosition += 8;
      }
    } else if (paymentMethod.payment_type === 'ach') {
      if (paymentMethod.bank_name) {
        doc.setFont(undefined, 'bold');
        doc.text('Bank Name:', 25, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(paymentMethod.bank_name, 80, yPosition);
        yPosition += 8;
      }

      if (paymentMethod.account_last_four) {
        doc.setFont(undefined, 'bold');
        doc.text('Account Number:', 25, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(`**** **** **** ${paymentMethod.account_last_four}`, 80, yPosition);
        yPosition += 8;
      }
    }

    // Nickname
    if (paymentMethod.nickname) {
      doc.setFont(undefined, 'bold');
      doc.text('Nickname:', 25, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(paymentMethod.nickname, 80, yPosition);
      yPosition += 8;
    }
  }

  // Lease Information Section (if available)
  if (leaseInfo || (payment.lease && payment.lease.unit)) {
    const lease = leaseInfo || payment.lease;

    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Property Information', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    if (lease.unit && lease.unit.property) {
      doc.setFont(undefined, 'bold');
      doc.text('Property:', 25, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(lease.unit.property.name || 'N/A', 80, yPosition);
      yPosition += 8;
    }

    if (lease.unit && lease.unit.unit_number) {
      doc.setFont(undefined, 'bold');
      doc.text('Unit:', 25, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(`#${lease.unit.unit_number}`, 80, yPosition);
      yPosition += 8;
    }

    if (lease.monthly_rent) {
      doc.setFont(undefined, 'bold');
      doc.text('Monthly Rent:', 25, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(formatCurrency(lease.monthly_rent), 80, yPosition);
      yPosition += 8;
    }
  }

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);

  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 5;
  doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 5;
  doc.text('For any questions or concerns, please contact your property manager.', pageWidth / 2, yPosition, { align: 'center' });

  // Generate filename
  const fileName = `payment-receipt-${payment.id}-${Date.now()}.pdf`;

  // Download the PDF
  doc.save(fileName);
};
