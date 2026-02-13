import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import SharedWalletDropdown from '../../components/wallet/SharedWalletDropdown';
import '../../assets/css/MakePayment.css';

/**
 * Make Payment Page with Shared Wallet UI Integration
 *
 * This page demonstrates the integration of the Shared Wallet UI
 * for payment method selection and management.
 */
function MakePaymentWithWallet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [leaseInfo, setLeaseInfo] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [formData, setFormData] = useState({
    lease_id: '',
    payment_method_token: '', // Using token instead of ID
    amount: '',
    payment_month: new Date().getMonth() + 1,
    payment_year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard to get lease info
      const dashboardResponse = await tenantService.getDashboard();
      const leaseData = dashboardResponse.data.data?.lease;

      if (!leaseData) {
        toast.error('No active lease found. Please contact your property manager.');
        setLoading(false);
        return;
      }

      setLeaseInfo(leaseData);

      // Pre-fill form
      setFormData({
        ...formData,
        lease_id: leaseData.id,
        amount: leaseData.monthlyRent || ''
      });

      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load payment information');
      setLoading(false);
    }
  };

  /**
   * Handle payment method selection from wallet
   */
  const handlePaymentSelected = (paymentDetail) => {
    console.log('🎯 Payment method selected:', paymentDetail);

    setSelectedPayment(paymentDetail);

    // Update form with selected payment token
    setFormData({
      ...formData,
      payment_method_token: paymentDetail.paymentInstrumentToken || paymentDetail.paymentMethodId
    });

    toast.success(`Payment method selected: ${paymentDetail.paymentMethodText || 'Payment method'}`);
  };

  /**
   * Handle new payment method added
   */
  const handlePaymentAdded = (paymentDetail) => {
    console.log('✅ New payment method added:', paymentDetail);

    toast.success(`${paymentDetail.type === 'card' ? 'Card' : 'Bank account'} added successfully!`);

    // Optionally auto-select the newly added payment
    // The wallet UI should automatically select it
  };

  /**
   * Handle wallet errors
   */
  const handleWalletError = (error) => {
    console.error('❌ Wallet error:', error);
    toast.error(error.message || 'An error occurred with the wallet');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than $0';
    }

    if (parseFloat(formData.amount) > parseFloat(leaseInfo?.monthlyRent) * 2) {
      errors.amount = `Amount seems unusually high. Monthly rent is ${formatCurrency(leaseInfo?.monthlyRent)}`;
    }

    if (!formData.payment_method_token) {
      errors.payment_method = 'Please select a payment method';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation
    if (name === 'amount' && value) {
      const errors = { ...validationErrors };
      if (parseFloat(value) <= 0) {
        errors.amount = 'Amount must be greater than $0';
      } else if (parseFloat(value) > parseFloat(leaseInfo?.monthlyRent) * 2) {
        errors.amount = `Amount seems high. Monthly rent is ${formatCurrency(leaseInfo?.monthlyRent)}`;
      } else {
        delete errors.amount;
      }
      setValidationErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmPayment = async () => {
    setShowConfirmModal(false);
    setProcessing(true);

    const toastId = toast.loading('Processing your payment...');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/payment/process',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.update(toastId, {
          render: `Payment of ${formatCurrency(formData.amount)} processed successfully!`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });

        setTimeout(() => {
          navigate('/tenant/payments');
        }, 2000);
      }
    } catch (err) {
      // Extract error message
      let errorMessage = 'Payment failed. Please try again.';

      if (err.response?.data?.error) {
        const errorData = err.response.data.error;
        if (typeof errorData === 'object' && errorData.errorInformation) {
          errorMessage = errorData.errorInformation.message || errorData.errorInformation.reason || 'Payment processing error';
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });

      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  };

  // Loading Skeleton
  if (loading) {
    return (
      <Layout>
        <div className="make-payment-container">
          <div className="skeleton-container">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-card"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!leaseInfo) {
    return (
      <Layout>
        <div className="make-payment-container">
          <div className="alert alert-error">Unable to load lease information</div>
          <button className="btn btn-secondary" onClick={() => navigate('/tenant/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="make-payment-container">
        <div className="page-header">
          <h1>💳 Make a Payment</h1>
          <p>Submit your rent payment securely using Shared Wallet UI</p>
          <div className="integration-badge">
            <span className="badge badge-new">🆕 Shared Wallet UI Integration</span>
          </div>
        </div>

        <div className="payment-form-card">
          <form onSubmit={handleSubmit}>
            {/* Lease Information */}
            <div className="form-section">
              <h3>📋 Lease Information</h3>
              <div className="info-row">
                <span className="label">Property:</span>
                <span className="value">{leaseInfo?.unit?.property?.name || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Unit:</span>
                <span className="value">#{leaseInfo?.unit?.unit_number || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Monthly Rent:</span>
                <span className="value">{formatCurrency(leaseInfo?.monthlyRent)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="form-section">
              <h3>💰 Payment Details</h3>

              <div className="form-group">
                <label htmlFor="payment_month">Payment For Month</label>
                <select
                  id="payment_month"
                  name="payment_month"
                  value={formData.payment_month}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="payment_year">Year</label>
                <select
                  id="payment_year"
                  name="payment_year"
                  value={formData.payment_year}
                  onChange={handleChange}
                  required
                >
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className={validationErrors.amount ? 'input-error' : ''}
                />
                {validationErrors.amount && (
                  <span className="validation-error">{validationErrors.amount}</span>
                )}
                <small>Standard rent: {formatCurrency(leaseInfo?.monthlyRent)}</small>
              </div>
            </div>

            {/* Shared Wallet UI - Payment Method Selection */}
            <div className="form-section">
              <h3>💳 Select Payment Method</h3>
              <p className="section-description">
                Choose an existing payment method or add a new one using the Shared Wallet UI below.
              </p>

              {validationErrors.payment_method && (
                <div className="alert alert-error">
                  {validationErrors.payment_method}
                </div>
              )}

              <SharedWalletDropdown
                environment="localdevelopment"
                displayMode="full"
                paymentType="all"
                onPaymentSelected={handlePaymentSelected}
                onPaymentAdded={handlePaymentAdded}
                onError={handleWalletError}
              />

              {selectedPayment && (
                <div className="selected-payment-info">
                  <p>
                    ✅ Selected: <strong>{selectedPayment.paymentMethodText}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="payment-summary">
              <div className="summary-row">
                <span>Payment For:</span>
                <span>{getMonthName(parseInt(formData.payment_month))} {formData.payment_year}</span>
              </div>
              <div className="summary-row">
                <span>Payment Method:</span>
                <span>
                  {selectedPayment ? selectedPayment.paymentMethodText : 'Not selected'}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>{formatCurrency(formData.amount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/tenant/dashboard')}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={processing || Object.keys(validationErrors).length > 0}
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(formData.amount)}`}
              </button>
            </div>
          </form>
        </div>

        <div className="payment-info">
          <p>
            <strong>Note:</strong> Your payment will be processed immediately and cannot be canceled once submitted.
            Please ensure all information is correct before proceeding.
          </p>
          <p className="integration-note">
            💡 This page uses the <strong>Shared Wallet UI</strong> for payment method management.
            You can add credit cards or bank accounts directly from this page.
          </p>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>🔒 Confirm Payment</h2>
              <p>Please review your payment details:</p>

              <div className="confirm-details">
                <div className="confirm-row">
                  <span>Amount:</span>
                  <strong>{formatCurrency(formData.amount)}</strong>
                </div>
                <div className="confirm-row">
                  <span>For:</span>
                  <strong>{getMonthName(parseInt(formData.payment_month))} {formData.payment_year}</strong>
                </div>
                <div className="confirm-row">
                  <span>Using:</span>
                  <strong>
                    {selectedPayment ? selectedPayment.paymentMethodText : 'N/A'}
                  </strong>
                </div>
              </div>

              <p className="confirm-warning">
                ⚠️ This action cannot be undone. The payment will be processed immediately.
              </p>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmPayment}
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MakePaymentWithWallet;
