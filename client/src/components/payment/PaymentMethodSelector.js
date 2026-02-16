import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { tenantService } from '../../services/api';
import './PaymentMethodSelector.css';

/**
 * Simple Payment Method Selector Component
 * Fetches and displays saved payment methods with option to add new
 */
const PaymentMethodSelector = forwardRef(({ onPaymentSelected, onAddNew }, ref) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    console.log('🎯 PaymentMethodSelector mounted, fetching payment methods...');
    fetchPaymentMethods();
  }, []);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log('🔄 Refreshing payment methods...');
      fetchPaymentMethods();
    }
  }));

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching payment methods from API...');
      const response = await tenantService.getPaymentMethods();
      console.log('✅ Payment methods response:', response);
      // Backend returns { success: true, data: [...payment methods] }
      const methods = response.data.data || [];
      console.log('💳 Found payment methods:', methods.length, methods);
      setPaymentMethods(methods);

      // Auto-select default payment method if available
      const defaultMethod = methods.find(m => m.is_default);
      if (defaultMethod) {
        console.log('🎯 Auto-selecting default method:', defaultMethod);
        handleSelectMethod(defaultMethod);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      setLoading(false);
    }
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setShowDropdown(false);

    if (onPaymentSelected) {
      onPaymentSelected({
        paymentMethodId: method.id,
        paymentInstrumentToken: method.cybersource_token,
        paymentMethodText: getPaymentMethodText(method)
      });
    }
  };

  const getPaymentMethodText = (method) => {
    if (method.payment_type === 'card') {
      return `${method.card_brand} ending in ${method.card_last_four}`;
    } else {
      return `${method.bank_name || 'Bank'} ${method.account_type} ending in ${method.account_last_four}`;
    }
  };

  const getPaymentMethodIcon = (method) => {
    if (method.payment_type === 'card') {
      switch (method.card_brand?.toLowerCase()) {
        case 'visa': return '💳';
        case 'mastercard': return '💳';
        case 'american express': return '💳';
        case 'discover': return '💳';
        default: return '💳';
      }
    }
    return '🏦';
  };

  if (loading) {
    return (
      <div className="payment-selector-loading">
        <div className="spinner"></div>
        <p>Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="payment-method-selector">
      <label>Payment Method *</label>

      <div className="selector-container">
        {/* Selected Payment Method Display */}
        <div
          className={`selected-method ${showDropdown ? 'open' : ''}`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selectedMethod ? (
            <div className="method-display">
              <span className="method-icon">{getPaymentMethodIcon(selectedMethod)}</span>
              <span className="method-text">{getPaymentMethodText(selectedMethod)}</span>
              {selectedMethod.is_default && <span className="default-badge">Default</span>}
            </div>
          ) : (
            <div className="method-display placeholder">
              <span className="method-icon">💳</span>
              <span className="method-text">Select a payment method</span>
            </div>
          )}
          <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
        </div>

        {/* Dropdown List */}
        {showDropdown && (
          <div className="dropdown-list">
            {/* Saved Payment Methods ONLY */}
            {paymentMethods.length > 0 ? (
              <div className="dropdown-section">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`dropdown-item ${selectedMethod?.id === method.id ? 'selected' : ''}`}
                    onClick={() => handleSelectMethod(method)}
                  >
                    <span className="method-icon">{getPaymentMethodIcon(method)}</span>
                    <div className="method-info">
                      <div className="method-name">{getPaymentMethodText(method)}</div>
                      {method.nickname && (
                        <div className="method-nickname">{method.nickname}</div>
                      )}
                      {method.payment_type === 'card' && (
                        <div className="method-expiry">
                          Expires {method.card_expiry_month}/{method.card_expiry_year}
                        </div>
                      )}
                    </div>
                    {method.is_default && <span className="default-badge">Default</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="dropdown-section">
                <div className="no-methods-in-dropdown">
                  No saved payment methods
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add New Button - Single button for all payment methods */}
      <div className="add-payment-buttons">
        <button
          type="button"
          className="btn-add-payment btn-add-payment-single"
          onClick={() => {
            if (onAddNew) onAddNew('all');
          }}
        >
          <span className="btn-icon">➕</span>
          Add New Payment Method
        </button>
      </div>

      {paymentMethods.length === 0 && !loading && (
        <p className="no-methods-message">
          💡 No payment methods saved yet. Use the buttons above to add one.
        </p>
      )}
    </div>
  );
});

export default PaymentMethodSelector;
