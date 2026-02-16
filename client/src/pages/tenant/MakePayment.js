import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import SharedWalletDropdown from '../../components/wallet/SharedWalletDropdown';
import IdentityVerificationForm from '../../components/wallet/IdentityVerificationForm';
import '../../assets/css/MakePayment.css';

function MakePayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [leaseInfo, setLeaseInfo] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [useWalletUI, setUseWalletUI] = useState(true); // Toggle for wallet UI

  // State for showing Shared Wallet UI for adding new payment methods
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [addPaymentType, setAddPaymentType] = useState('all');
  const paymentSelectorRef = useRef(null);

  // State for identity verification
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const [formData, setFormData] = useState({
    lease_id: '',
    payment_method_id: '',
    amount: '',
    payment_month: new Date().getMonth() + 1,
    payment_year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Check identity verification requirements when amount changes
  useEffect(() => {
    const checkVerification = async () => {
      const amount = parseFloat(formData.amount);

      console.log('🔍 Checking verification for amount:', amount);

      // Only check if amount is valid and greater than 0
      if (!amount || amount <= 0 || isNaN(amount)) {
        console.log('⏭️ Skipping verification check - invalid amount');
        setVerificationRequired(false);
        return;
      }

      try {
        setCheckingVerification(true);
        const token = localStorage.getItem('token');

        console.log('📡 Making API call to /api/identity-verification/check with amount:', amount);
        console.log('🔑 Token exists:', !!token);

        const response = await axios.post(
          '/api/identity-verification/check',
          { amount },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('📥 API Response:', response.data);

        if (response.data.hasExisting) {
          // User already verified
          console.log('✅ User already has identity verification on file');
          setVerificationRequired(false);
          setVerificationComplete(true);
        } else if (response.data.required) {
          // Needs verification
          console.log('🔒 Identity verification required for $' + amount);
          console.log('🎯 Setting verificationRequired to TRUE');
          setVerificationRequired(true);
          setVerificationComplete(false);
        } else {
          // Below threshold
          console.log('💰 Amount below threshold, no verification needed');
          setVerificationRequired(false);
          setVerificationComplete(false);
        }

      } catch (error) {
        console.error('❌ Error checking verification:', error);
        console.error('❌ Error details:', error.response?.data);
        // On error, don't block the payment
        setVerificationRequired(false);
      } finally {
        setCheckingVerification(false);
      }
    };

    // Debounce the check (wait 500ms after user stops typing)
    const timeoutId = setTimeout(() => {
      checkVerification();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.amount]);

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

      // Fetch payment methods
      const paymentMethodsResponse = await tenantService.getPaymentMethods();
      const methods = paymentMethodsResponse.data.data || [];

      if (methods.length === 0) {
        toast.warn('No payment methods on file. Please add a payment method first.');
        setLoading(false);
        return;
      }

      setPaymentMethods(methods);

      // Pre-fill form
      setFormData({
        ...formData,
        lease_id: leaseData.id,
        payment_method_id: methods.find(m => m.is_default)?.id || methods[0]?.id,
        amount: leaseData.monthlyRent || ''
      });

      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load payment information');
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than $0';
    }

    if (parseFloat(formData.amount) > parseFloat(leaseInfo?.monthlyRent) * 2) {
      errors.amount = `Amount seems unusually high. Monthly rent is ${formatCurrency(leaseInfo?.monthlyRent)}`;
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

  /**
   * Handle payment method selection from wallet UI
   */
  const handlePaymentSelected = (paymentDetail) => {
    console.log('💳 Payment method selected from wallet:', paymentDetail);

    setSelectedPayment(paymentDetail);

    // Extract payment method ID from the token (format: pi_123)
    const tokenParts = paymentDetail.paymentInstrumentToken?.split('_');
    const paymentMethodId = tokenParts && tokenParts.length > 1 ? tokenParts[1] : '';

    if (paymentMethodId) {
      setFormData({
        ...formData,
        payment_method_id: paymentMethodId
      });
      toast.success(`Payment method selected: ${paymentDetail.paymentMethodText || 'Payment method'}`);
    }
  };

  /**
   * Handle new payment method added via wallet UI
   */
  const handlePaymentAdded = (paymentDetail) => {
    console.log('✅ New payment method added:', paymentDetail);
    toast.success(`${paymentDetail.type === 'card' ? 'Card' : 'Bank account'} added successfully!`);

    // Close the add wallet UI
    setShowAddWallet(false);

    // Refresh the payment method selector
    if (paymentSelectorRef.current && paymentSelectorRef.current.refresh) {
      paymentSelectorRef.current.refresh();
    }

    // Refresh payment methods list
    fetchData();
  };

  /**
   * Handle wallet errors
   */
  const handleWalletError = (error) => {
    console.error('❌ Wallet error:', error);
    toast.error(error.message || 'An error occurred with the wallet');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    if (!formData.payment_method_id) {
      toast.error('Please select a payment method');
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
        '/api/payment/process',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Build detailed success message
        const paymentData = response.data.data || {};
        const successMessage = (
          <div>
            <strong>✅ Payment Successful!</strong>
            <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
              <div>💰 Amount: ${parseFloat(formData.amount).toFixed(2)}</div>
              {paymentData.transaction_id && (
                <div>🔑 Transaction ID: {paymentData.transaction_id}</div>
              )}
              <div>📅 Period: {formData.payment_month}/{formData.payment_year}</div>
              <div style={{ marginTop: '4px', color: '#4CAF50' }}>
                Redirecting to payment history...
              </div>
            </div>
          </div>
        );

        toast.update(toastId, {
          render: successMessage,
          type: 'success',
          isLoading: false,
          autoClose: 4000
        });

        setTimeout(() => {
          navigate('/tenant/payments');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      console.error('❌ Error response:', err.response?.data);

      // Extract error message with detailed information
      let errorMessage = 'Payment failed. Please try again.';
      let errorDetails = null;

      // Network error (no response from server)
      if (!err.response) {
        errorMessage = (
          <div>
            <strong>❌ Network Error</strong>
            <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
              Unable to connect to the payment server. Please check your internet connection and try again.
            </div>
          </div>
        );
      }
      // Server responded with error
      else if (err.response?.data) {
        const responseData = err.response.data;
        const statusCode = err.response.status;

        // Overpayment error with detailed breakdown
        if (responseData.details && responseData.details.totalPaid !== undefined) {
          errorDetails = responseData.details;
          errorMessage = (
            <div>
              <strong>⚠️ Payment Exceeds Monthly Rent</strong>
              <div style={{ marginTop: '8px', fontSize: '0.9em', lineHeight: '1.6' }}>
                <div>💰 Already Paid: <strong>${errorDetails.totalPaid}</strong></div>
                <div>🏠 Monthly Rent: <strong>${errorDetails.monthlyRent}</strong></div>
                <div>💵 You Requested: <strong>${errorDetails.requestedAmount}</strong></div>
                <div style={{ marginTop: '8px', padding: '8px', background: '#e8f5e9', borderRadius: '4px' }}>
                  <strong style={{ color: '#2e7d32' }}>
                    ✅ You can pay up to: ${errorDetails.availableAmount}
                  </strong>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85em', color: '#666' }}>
                  💡 Tip: Adjust the amount to ${errorDetails.availableAmount} or less
                </div>
              </div>
            </div>
          );
        }
        // Duplicate payment error
        else if (responseData.message && responseData.message.includes('already exists')) {
          errorMessage = (
            <div>
              <strong>⚠️ Duplicate Payment</strong>
              <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                {responseData.message}
                <div style={{ marginTop: '8px', fontSize: '0.85em', color: '#666' }}>
                  💡 Check your payment history to see if this payment was already processed.
                </div>
              </div>
            </div>
          );
        }
        // Lease not found
        else if (statusCode === 404 && responseData.message?.includes('lease')) {
          errorMessage = (
            <div>
              <strong>❌ Lease Not Found</strong>
              <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                Unable to find your active lease. Please contact property management.
              </div>
            </div>
          );
        }
        // Payment method not found
        else if (statusCode === 404 && responseData.message?.includes('payment method')) {
          errorMessage = (
            <div>
              <strong>❌ Payment Method Not Found</strong>
              <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                Please select a valid payment method or add a new one.
              </div>
            </div>
          );
        }
        // Authentication error
        else if (statusCode === 401 || statusCode === 403) {
          errorMessage = (
            <div>
              <strong>🔒 Authentication Required</strong>
              <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                Your session has expired. Please log in again.
              </div>
            </div>
          );
          // Redirect to login after showing error
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
        // Generic server error with message
        else if (responseData.message) {
          errorMessage = (
            <div>
              <strong>❌ Payment Failed</strong>
              <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                {responseData.message}
              </div>
            </div>
          );
        }
        // Cybersource/payment processor error
        else if (responseData.error) {
          const errorData = responseData.error;
          if (typeof errorData === 'object' && errorData.errorInformation) {
            const processorMessage = errorData.errorInformation.message || errorData.errorInformation.reason;
            errorMessage = (
              <div>
                <strong>❌ Payment Processor Error</strong>
                <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                  {processorMessage || 'Payment processing failed'}
                  <div style={{ marginTop: '8px', fontSize: '0.85em', color: '#666' }}>
                    💡 Please check your payment method details and try again.
                  </div>
                </div>
              </div>
            );
          } else if (typeof errorData === 'string') {
            errorMessage = (
              <div>
                <strong>❌ Payment Failed</strong>
                <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                  {errorData}
                </div>
              </div>
            );
          }
        }
      }

      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 10000 // Longer duration for detailed errors
      });

      setProcessing(false);
    }
  };

  /**
   * Handle identity verification completion
   */
  const handleVerificationComplete = (result) => {
    console.log('✅ Identity verification complete:', result);
    setVerificationComplete(true);
    setVerificationRequired(false);
    toast.success('Identity verified successfully! You may now proceed with your payment.');
  };

  /**
   * Handle identity verification cancellation
   */
  const handleVerificationCancel = () => {
    console.log('❌ Identity verification cancelled by user');
    setVerificationRequired(false);
    setVerificationComplete(false);
    // Clear the amount to force user to re-enter
    setFormData({ ...formData, amount: '' });
    toast.info('Payment cancelled. Please adjust the amount or try again later.');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentMethodDisplay = (method) => {
    if (method.payment_type === 'card') {
      return `${method.card_brand || 'Card'} ending in ${method.card_last_four}`;
    } else if (method.payment_type === 'ach') {
      return `${method.bank_name || 'Bank Account'} ending in ${method.account_last_four}`;
    }
    return 'Unknown';
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
          <p>Submit your rent payment securely</p>
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

              {/* Payment Method Selection */}
              <div className="form-group wallet-ui-section">
                <PaymentMethodSelector
                  ref={paymentSelectorRef}
                  onPaymentSelected={handlePaymentSelected}
                  onAddNew={(type) => {
                    // Show Shared Wallet UI with both payment options
                    // Always show 'all' to display both card and bank options
                    console.log('🎯 onAddNew called with type:', type);
                    console.log('🎯 Setting addPaymentType to: all (showing both options)');
                    setAddPaymentType('all');
                    setShowAddWallet(true);
                  }}
                />

                {selectedPayment && (
                  <div className="selected-payment-badge">
                    ✅ Selected: <strong>{selectedPayment.paymentMethodText}</strong>
                  </div>
                )}
              </div>
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
                  {selectedPayment
                    ? selectedPayment.paymentMethodText
                    : (paymentMethods.find(m => m.id === parseInt(formData.payment_method_id))
                        ? getPaymentMethodDisplay(paymentMethods.find(m => m.id === parseInt(formData.payment_method_id)))
                        : 'Select a payment method')}
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
        </div>

        {/* Debug: Log modal state */}
        {console.log('🎭 Modal State - verificationRequired:', verificationRequired, 'verificationComplete:', verificationComplete, 'Should show modal:', verificationRequired && !verificationComplete)}

        {/* Identity Verification Modal */}
        {verificationRequired && !verificationComplete && (
          <div className="modal-overlay">
            <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()}>
              <IdentityVerificationForm
                onComplete={handleVerificationComplete}
                onCancel={handleVerificationCancel}
              />
            </div>
          </div>
        )}

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
                    {selectedPayment
                      ? selectedPayment.paymentMethodText
                      : (paymentMethods.find(m => m.id === parseInt(formData.payment_method_id))
                          ? getPaymentMethodDisplay(paymentMethods.find(m => m.id === parseInt(formData.payment_method_id)))
                          : 'N/A')}
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

        {/* Add Payment Method Modal - Shared Wallet UI */}
        {showAddWallet && (
          <div className="modal-overlay" onClick={() => setShowAddWallet(false)}>
            <div className="modal-content wallet-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>💳 Add Payment Method</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowAddWallet(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="wallet-iframe-container">
                <SharedWalletDropdown
                  environment="localdevelopment"
                  displayMode="full"
                  paymentType={addPaymentType}
                  onPaymentSelected={handlePaymentSelected}
                  onPaymentAdded={handlePaymentAdded}
                  onError={handleWalletError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MakePayment;
