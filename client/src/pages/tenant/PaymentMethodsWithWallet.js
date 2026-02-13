import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import SharedWalletDropdown from '../../components/wallet/SharedWalletDropdown';
import './PaymentMethodsWithWallet.css';

/**
 * Payment Methods Management Page with Shared Wallet UI
 *
 * This page allows tenants to manage their payment methods
 * (credit cards and bank accounts) using the Shared Wallet UI.
 */
function PaymentMethodsWithWallet() {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Handle payment method selection
   */
  const handlePaymentSelected = (paymentDetail) => {
    console.log('💳 Payment method selected:', paymentDetail);
    setSelectedPayment(paymentDetail);
  };

  /**
   * Handle new payment method added
   */
  const handlePaymentAdded = (paymentDetail) => {
    console.log('✅ New payment method added:', paymentDetail);

    const methodType = paymentDetail.type === 'card' ? 'Credit Card' : 'Bank Account';
    toast.success(`${methodType} added successfully!`, {
      position: 'top-right',
      autoClose: 3000
    });

    // Refresh the wallet dropdown to show the new payment method
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Handle wallet errors
   */
  const handleWalletError = (error) => {
    console.error('❌ Wallet error:', error);

    const errorMessage = error.message || error.error || 'An error occurred with the wallet';
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 5000
    });
  };

  /**
   * Navigate to make payment with selected method
   */
  const handleMakePayment = () => {
    if (!selectedPayment) {
      toast.warn('Please select a payment method first');
      return;
    }

    // Navigate to payment page with selected payment method
    navigate('/tenant/make-payment-wallet', {
      state: {
        selectedPayment: selectedPayment
      }
    });
  };

  return (
    <Layout title="Payment Methods">
      <div className="payment-methods-wallet-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>💳 Payment Methods</h1>
            <p>Manage your credit cards and bank accounts using Shared Wallet UI</p>
            <div className="integration-badge">
              <span className="badge badge-new">🆕 Shared Wallet UI Integration</span>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/tenant/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h3>About Payment Methods</h3>
            <ul>
              <li>
                <strong>Add Payment Methods:</strong> Use the form below to add credit cards or bank accounts
              </li>
              <li>
                <strong>Select Default:</strong> Choose your preferred payment method for quick payments
              </li>
              <li>
                <strong>Secure Storage:</strong> All payment information is encrypted and securely stored
              </li>
              <li>
                <strong>Easy Management:</strong> View, add, and manage all your payment methods in one place
              </li>
            </ul>
          </div>
        </div>

        {/* Wallet UI Card */}
        <div className="wallet-card">
          <div className="card-header">
            <h2>🔐 Your Payment Methods</h2>
            <p>Select an existing payment method or add a new one</p>
          </div>

          <div className="card-body">
            <SharedWalletDropdown
              key={refreshKey}
              environment="localdevelopment"
              displayMode="full"
              paymentType="all"
              onPaymentSelected={handlePaymentSelected}
              onPaymentAdded={handlePaymentAdded}
              onError={handleWalletError}
            />
          </div>

          {/* Selected Payment Info */}
          {selectedPayment && (
            <div className="selected-payment-section">
              <div className="selected-payment-header">
                <h3>✅ Selected Payment Method</h3>
              </div>
              <div className="selected-payment-details">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">
                    {selectedPayment.paymentInstrumentType || selectedPayment.paymentMethodType || 'Unknown'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Details:</span>
                  <span className="detail-value">
                    {selectedPayment.paymentMethodText || selectedPayment.maskedNumber || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Token:</span>
                  <span className="detail-value detail-token">
                    {selectedPayment.paymentInstrumentToken || selectedPayment.paymentMethodId || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="selected-payment-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleMakePayment}
                >
                  Make Payment with This Method →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="help-section">
          <h3>💡 Need Help?</h3>
          <div className="help-content">
            <div className="help-item">
              <strong>Adding a Credit Card:</strong>
              <p>Click "Add Card" in the dropdown above, enter your card details, and submit. Your card will be tokenized securely.</p>
            </div>
            <div className="help-item">
              <strong>Adding a Bank Account:</strong>
              <p>Click "Add Bank Account", provide your routing and account numbers, and submit. Perfect for ACH payments.</p>
            </div>
            <div className="help-item">
              <strong>Security:</strong>
              <p>All payment information is encrypted and processed securely. We never store your full card numbers or account details.</p>
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <div className="integration-info">
          <h4>🔄 Shared Wallet UI Integration</h4>
          <p>
            This page demonstrates the integration of the <strong>Shared Wallet UI</strong> web component
            for payment method management. The wallet UI handles:
          </p>
          <ul>
            <li>Payment method tokenization</li>
            <li>Secure data collection</li>
            <li>Fraud detection (Oscilar)</li>
            <li>Identity verification (IDV)</li>
            <li>Address validation (AVS)</li>
            <li>Multi-factor authentication (MFA)</li>
          </ul>
          <p>
            <strong>Environment:</strong> Local Development (Mock Mode)<br/>
            <strong>BFF API:</strong> http://localhost:5000/api/wallet-bff
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default PaymentMethodsWithWallet;
