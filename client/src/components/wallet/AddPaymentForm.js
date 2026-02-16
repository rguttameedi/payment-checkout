import React, { useState } from 'react';
import axios from 'axios';
import './AddPaymentForm.css';

/**
 * Custom Add Payment Form
 * Only requires essential tokenization fields:
 * - Name on Card, Card Number, Expiry Date, CVV
 *
 * Optional fields:
 * - Billing Address, Nickname, Set as Default
 */
function AddPaymentForm({ paymentType = 'all', onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    // Required fields
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',

    // Optional fields
    nickname: '',
    setAsDefault: false,
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [activeTab, setActiveTab] = useState('card'); // 'card' or 'bank'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Bank account state
  const [bankData, setBankData] = useState({
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
    bankName: '',
    nickname: '',
    setAsDefault: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (activeTab === 'card') {
      if (name.startsWith('billing.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress,
            [field]: value
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }
    } else {
      setBankData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, cardNumber: value }));
    }
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const month = value.slice(0, 2);
      const year = value.slice(2, 4);

      setFormData(prev => ({
        ...prev,
        expiryMonth: month,
        expiryYear: year ? '20' + year : ''
      }));
    }
  };

  const handleCVVChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, cvv: value }));
    }
  };

  const validateCardForm = () => {
    const errors = {};

    if (!formData.cardHolderName.trim()) {
      errors.cardHolderName = 'Name on Card is required';
    }

    if (!formData.cardNumber || formData.cardNumber.length < 13) {
      errors.cardNumber = 'Valid Card Number is required';
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      errors.expiry = 'Expiry Date is required';
    } else {
      const month = parseInt(formData.expiryMonth);
      if (month < 1 || month > 12) {
        errors.expiry = 'Invalid month';
      }
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      errors.cvv = 'Valid CVV is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBankForm = () => {
    const errors = {};

    if (!bankData.accountHolderName.trim()) {
      errors.accountHolderName = 'Account Holder Name is required';
    }

    if (!bankData.routingNumber || bankData.routingNumber.length !== 9) {
      errors.routingNumber = 'Valid 9-digit Routing Number is required';
    }

    if (!bankData.accountNumber || bankData.accountNumber.length < 4) {
      errors.accountNumber = 'Valid Account Number is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'card') {
      if (!validateCardForm()) {
        return;
      }
    } else {
      if (!validateBankForm()) {
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'card'
        ? 'http://localhost:50155/api/v1/payment-instruments/card'
        : 'http://localhost:50155/api/v1/payment-instruments/bank';

      const payload = activeTab === 'card' ? {
        cardNumber: formData.cardNumber,
        cardHolderName: formData.cardHolderName,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        nickname: formData.nickname || null,
        billingAddress: showOptionalFields && formData.billingAddress.line1
          ? formData.billingAddress
          : null,
        setAsDefault: formData.setAsDefault
      } : {
        accountType: bankData.accountType,
        routingNumber: bankData.routingNumber,
        accountNumber: bankData.accountNumber,
        accountHolderName: bankData.accountHolderName,
        bankName: bankData.bankName || null,
        nickname: bankData.nickname || null,
        setAsDefault: bankData.setAsDefault
      };

      console.log('📤 Submitting payment method:', activeTab, payload);

      const response = await axios.post(endpoint, payload, {
        headers: {
          'user-scoped-access-token': token,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Payment method added:', response.data);

      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (err) {
      console.error('❌ Error adding payment method:', err);

      const errorMessage = err.response?.data?.error?.message
        || err.response?.data?.message
        || 'Failed to add payment method. Please try again.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-payment-form">
      {/* Tab Selector */}
      {paymentType === 'all' && (
        <div className="payment-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'card' ? 'active' : ''}`}
            onClick={() => setActiveTab('card')}
          >
            💳 Credit/Debit Card
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            🏦 Bank Account
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {activeTab === 'card' ? (
          <>
            {/* REQUIRED FIELDS */}
            <div className="form-section">
              <h3 className="section-title">Card Information</h3>

              <div className="form-group">
                <label htmlFor="cardHolderName">
                  Name on Card <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="cardHolderName"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={fieldErrors.cardHolderName ? 'error' : ''}
                />
                {fieldErrors.cardHolderName && (
                  <span className="error-message">{fieldErrors.cardHolderName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">
                  Card Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formatCardNumber(formData.cardNumber)}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className={fieldErrors.cardNumber ? 'error' : ''}
                />
                {fieldErrors.cardNumber && (
                  <span className="error-message">{fieldErrors.cardNumber}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiry">
                    Expiry Date <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    value={formatExpiry((formData.expiryMonth || '') + (formData.expiryYear ? formData.expiryYear.slice(-2) : ''))}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className={fieldErrors.expiry ? 'error' : ''}
                  />
                  {fieldErrors.expiry && (
                    <span className="error-message">{fieldErrors.expiry}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">
                    CVV <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleCVVChange}
                    placeholder="123"
                    maxLength="4"
                    className={fieldErrors.cvv ? 'error' : ''}
                  />
                  {fieldErrors.cvv && (
                    <span className="error-message">{fieldErrors.cvv}</span>
                  )}
                </div>
              </div>
            </div>

            {/* OPTIONAL FIELDS */}
            <div className="optional-section">
              <button
                type="button"
                className="toggle-optional"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
              >
                {showOptionalFields ? '▼' : '▶'} Optional Details
              </button>

              {showOptionalFields && (
                <div className="optional-fields">
                  <div className="form-group">
                    <label htmlFor="nickname">Card Nickname (Optional)</label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="e.g., Personal Card"
                    />
                  </div>

                  <h4 className="subsection-title">Billing Address (Optional)</h4>

                  <div className="form-group">
                    <label htmlFor="billing.line1">Address Line 1</label>
                    <input
                      type="text"
                      id="billing.line1"
                      name="billing.line1"
                      value={formData.billingAddress.line1}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="billing.line2">Address Line 2</label>
                    <input
                      type="text"
                      id="billing.line2"
                      name="billing.line2"
                      value={formData.billingAddress.line2}
                      onChange={handleInputChange}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="billing.city">City</label>
                      <input
                        type="text"
                        id="billing.city"
                        name="billing.city"
                        value={formData.billingAddress.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="billing.state">State</label>
                      <input
                        type="text"
                        id="billing.state"
                        name="billing.state"
                        value={formData.billingAddress.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                        maxLength="2"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="billing.postalCode">ZIP Code</label>
                    <input
                      type="text"
                      id="billing.postalCode"
                      name="billing.postalCode"
                      value={formData.billingAddress.postalCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="setAsDefault"
                  checked={formData.setAsDefault}
                  onChange={handleInputChange}
                />
                Set as default payment method
              </label>
            </div>
          </>
        ) : (
          <>
            {/* BANK ACCOUNT FORM */}
            <div className="form-section">
              <h3 className="section-title">Bank Account Information</h3>

              <div className="form-group">
                <label htmlFor="accountHolderName">
                  Account Holder Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="accountHolderName"
                  name="accountHolderName"
                  value={bankData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={fieldErrors.accountHolderName ? 'error' : ''}
                />
                {fieldErrors.accountHolderName && (
                  <span className="error-message">{fieldErrors.accountHolderName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="accountType">Account Type</label>
                <select
                  id="accountType"
                  name="accountType"
                  value={bankData.accountType}
                  onChange={handleInputChange}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="routingNumber">
                  Routing Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="routingNumber"
                  name="routingNumber"
                  value={bankData.routingNumber}
                  onChange={handleInputChange}
                  placeholder="123456789"
                  maxLength="9"
                  className={fieldErrors.routingNumber ? 'error' : ''}
                />
                {fieldErrors.routingNumber && (
                  <span className="error-message">{fieldErrors.routingNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber">
                  Account Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={bankData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  className={fieldErrors.accountNumber ? 'error' : ''}
                />
                {fieldErrors.accountNumber && (
                  <span className="error-message">{fieldErrors.accountNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bankName">Bank Name (Optional)</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={bankData.bankName}
                  onChange={handleInputChange}
                  placeholder="Chase Bank"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nickname">Account Nickname (Optional)</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={bankData.nickname}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Checking"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="setAsDefault"
                    checked={bankData.setAsDefault}
                    onChange={handleInputChange}
                  />
                  Set as default payment method
                </label>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Adding...' : `Add ${activeTab === 'card' ? 'Card' : 'Bank Account'}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPaymentForm;
