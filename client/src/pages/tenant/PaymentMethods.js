import React, { useState, useEffect } from 'react';
import { tenantService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/PaymentMethods.css';

function TenantPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    payment_type: 'card',
    nickname: '',
    // Card fields
    card_number: '',
    card_last_four: '',
    card_brand: '',
    card_expiry_month: '',
    card_expiry_year: '',
    card_cvv: '',
    // ACH fields
    routing_number: '',
    account_number: '',
    account_last_four: '',
    account_type: 'checking',
    bank_name: '',
    // Billing address
    billing_address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US'
    },
    is_default: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getPaymentMethods();
      setPaymentMethods(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('billing_')) {
      const addressField = name.replace('billing_', '');
      setFormData({
        ...formData,
        billing_address: {
          ...formData.billing_address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    // Only allow numbers
    value = value.replace(/\D/g, '');
    // Limit to 16 digits
    value = value.substring(0, 16);

    setFormData({
      ...formData,
      card_number: value,
      card_last_four: value.slice(-4)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // In a real app, you would tokenize the card/bank details first with Cybersource
      // For now, we'll simulate this with a dummy token
      const tokenizedData = {
        payment_type: formData.payment_type,
        nickname: formData.nickname,
        cybersource_token: `tok_${Math.random().toString(36).substring(7)}`,
        billing_address: formData.billing_address,
        is_default: formData.is_default || paymentMethods.length === 0 // First method is default
      };

      if (formData.payment_type === 'card') {
        tokenizedData.card_last_four = formData.card_last_four;
        tokenizedData.card_brand = detectCardBrand(formData.card_number);
        tokenizedData.card_expiry_month = formData.card_expiry_month;
        tokenizedData.card_expiry_year = formData.card_expiry_year;
      } else {
        tokenizedData.account_last_four = formData.account_number.slice(-4);
        tokenizedData.account_type = formData.account_type;
        tokenizedData.bank_name = formData.bank_name;
      }

      await tenantService.addPaymentMethod(tokenizedData);

      // Refresh list
      await fetchPaymentMethods();

      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment method');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await tenantService.deletePaymentMethod(id);
      await fetchPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete payment method');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await tenantService.updatePaymentMethod(id, { is_default: true });
      await fetchPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default payment method');
    }
  };

  const resetForm = () => {
    setFormData({
      payment_type: 'card',
      nickname: '',
      card_number: '',
      card_last_four: '',
      card_brand: '',
      card_expiry_month: '',
      card_expiry_year: '',
      card_cvv: '',
      routing_number: '',
      account_number: '',
      account_last_four: '',
      account_type: 'checking',
      bank_name: '',
      billing_address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'US'
      },
      is_default: false
    });
  };

  const detectCardBrand = (cardNumber) => {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'Mastercard';
    if (cardNumber.startsWith('3')) return 'American Express';
    if (cardNumber.startsWith('6')) return 'Discover';
    return 'Unknown';
  };

  const getCardIcon = (brand) => {
    const icons = {
      'Visa': '💳',
      'Mastercard': '💳',
      'American Express': '💳',
      'Discover': '💳'
    };
    return icons[brand] || '💳';
  };

  return (
    <Layout title="Payment Methods">
      <div className="payment-methods-container">
        {/* Header with Add Button */}
        <div className="page-header">
          <div>
            <h1>💳 Payment Methods</h1>
            <p className="page-subtitle">Manage your saved cards and bank accounts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <span className="btn-icon">+</span>
            Add Payment Method
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')} className="btn-close">×</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading payment methods...</p>
          </div>
        )}

        {/* Payment Methods List */}
        {!loading && (
          <>
            {paymentMethods.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>No payment methods</h3>
                <p>Add a credit card or bank account to make payments easier.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                >
                  Add Your First Payment Method
                </button>
              </div>
            ) : (
              <div className="payment-methods-grid">
                {paymentMethods.map((method) => (
                  <div key={method.id} className={`payment-method-card ${method.is_default ? 'default' : ''}`}>
                    {method.is_default && (
                      <div className="default-badge">
                        ⭐ Default
                      </div>
                    )}

                    <div className="method-header">
                      <span className="method-icon">
                        {method.payment_type === 'card' ? getCardIcon(method.card_brand) : '🏦'}
                      </span>
                      <h3>{method.nickname || 'Payment Method'}</h3>
                    </div>

                    <div className="method-details">
                      {method.payment_type === 'card' ? (
                        <>
                          <div className="detail-row">
                            <span className="detail-label">Card Brand:</span>
                            <span className="detail-value">{method.card_brand}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Card Number:</span>
                            <span className="detail-value">**** **** **** {method.card_last_four}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Expires:</span>
                            <span className="detail-value">
                              {method.card_expiry_month}/{method.card_expiry_year}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="detail-row">
                            <span className="detail-label">Bank:</span>
                            <span className="detail-value">{method.bank_name || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Account Type:</span>
                            <span className="detail-value capitalize">{method.account_type}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Account:</span>
                            <span className="detail-value">****{method.account_last_four}</span>
                          </div>
                        </>
                      )}

                      {method.billing_address && (
                        <div className="detail-row">
                          <span className="detail-label">Billing Address:</span>
                          <span className="detail-value">
                            {method.billing_address.city}, {method.billing_address.state} {method.billing_address.zip_code}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="method-actions">
                      {!method.is_default && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="btn btn-sm btn-secondary"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Payment Method Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Payment Method</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Payment Type Selection */}
                  <div className="form-group">
                    <label>Payment Type</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="payment_type"
                          value="card"
                          checked={formData.payment_type === 'card'}
                          onChange={handleInputChange}
                        />
                        💳 Credit/Debit Card
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="payment_type"
                          value="ach"
                          checked={formData.payment_type === 'ach'}
                          onChange={handleInputChange}
                        />
                        🏦 Bank Account (ACH)
                      </label>
                    </div>
                  </div>

                  {/* Nickname */}
                  <div className="form-group">
                    <label htmlFor="nickname">Nickname (Optional)</label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="e.g., My Visa Card, Chase Checking"
                      className="form-input"
                    />
                  </div>

                  {/* Card-specific fields */}
                  {formData.payment_type === 'card' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="card_number">Card Number *</label>
                        <input
                          type="text"
                          id="card_number"
                          name="card_number"
                          value={formData.card_number}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          required
                          maxLength="16"
                          className="form-input"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="card_expiry_month">Expiry Month *</label>
                          <select
                            id="card_expiry_month"
                            name="card_expiry_month"
                            value={formData.card_expiry_month}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <option key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="card_expiry_year">Expiry Year *</label>
                          <select
                            id="card_expiry_year"
                            name="card_expiry_year"
                            value={formData.card_expiry_year}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            <option value="">YYYY</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="card_cvv">CVV *</label>
                          <input
                            type="text"
                            id="card_cvv"
                            name="card_cvv"
                            value={formData.card_cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                            maxLength="4"
                            className="form-input"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* ACH-specific fields */}
                  {formData.payment_type === 'ach' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="bank_name">Bank Name *</label>
                        <input
                          type="text"
                          id="bank_name"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleInputChange}
                          placeholder="e.g., Chase Bank"
                          required
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="account_type">Account Type *</label>
                        <select
                          id="account_type"
                          name="account_type"
                          value={formData.account_type}
                          onChange={handleInputChange}
                          required
                          className="form-select"
                        >
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="routing_number">Routing Number *</label>
                        <input
                          type="text"
                          id="routing_number"
                          name="routing_number"
                          value={formData.routing_number}
                          onChange={handleInputChange}
                          placeholder="123456789"
                          required
                          maxLength="9"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="account_number">Account Number *</label>
                        <input
                          type="text"
                          id="account_number"
                          name="account_number"
                          value={formData.account_number}
                          onChange={handleInputChange}
                          placeholder="1234567890"
                          required
                          className="form-input"
                        />
                      </div>
                    </>
                  )}

                  {/* Billing Address */}
                  <h3 className="section-title">Billing Address</h3>

                  <div className="form-group">
                    <label htmlFor="billing_line1">Address Line 1 *</label>
                    <input
                      type="text"
                      id="billing_line1"
                      name="billing_line1"
                      value={formData.billing_address.line1}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="billing_line2">Address Line 2</label>
                    <input
                      type="text"
                      id="billing_line2"
                      name="billing_line2"
                      value={formData.billing_address.line2}
                      onChange={handleInputChange}
                      placeholder="Apt 4B"
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="billing_city">City *</label>
                      <input
                        type="text"
                        id="billing_city"
                        name="billing_city"
                        value={formData.billing_address.city}
                        onChange={handleInputChange}
                        placeholder="San Francisco"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="billing_state">State *</label>
                      <input
                        type="text"
                        id="billing_state"
                        name="billing_state"
                        value={formData.billing_address.state}
                        onChange={handleInputChange}
                        placeholder="CA"
                        required
                        maxLength="2"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="billing_zip_code">ZIP Code *</label>
                      <input
                        type="text"
                        id="billing_zip_code"
                        name="billing_zip_code"
                        value={formData.billing_address.zip_code}
                        onChange={handleInputChange}
                        placeholder="94105"
                        required
                        maxLength="10"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Default checkbox */}
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                      />
                      Set as default payment method
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Add Payment Method'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="security-notice">
          <div className="notice-icon">🔒</div>
          <div>
            <h4>Your payment information is secure</h4>
            <p>
              All payment details are encrypted and securely stored. We use industry-standard
              PCI-compliant tokenization to protect your sensitive information.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default TenantPaymentMethods;
