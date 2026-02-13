import React, { useState, useEffect } from 'react';
import { tenantService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/AutoPay.css';

function TenantAutoPay() {
  const [schedule, setSchedule] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [formData, setFormData] = useState({
    payment_method_id: '',
    payment_day: '1',
    send_reminder_email: true,
    reminder_days_before: '3'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both schedule and payment methods
      const [scheduleResponse, methodsResponse] = await Promise.all([
        tenantService.getRecurringSchedule().catch(() => ({ data: null })),
        tenantService.getPaymentMethods()
      ]);

      setSchedule(scheduleResponse.data);
      setPaymentMethods(methodsResponse.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load auto-pay settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await tenantService.createRecurringSchedule(formData);
      await fetchData();
      setShowSetupModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set up auto-pay');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await tenantService.updateRecurringSchedule(schedule.id, formData);
      await fetchData();
      setShowSetupModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update auto-pay');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel auto-pay? You will need to make manual payments each month.')) {
      return;
    }

    try {
      await tenantService.cancelRecurringSchedule(schedule.id);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel auto-pay');
    }
  };

  const resetForm = () => {
    setFormData({
      payment_method_id: '',
      payment_day: '1',
      send_reminder_email: true,
      reminder_days_before: '3'
    });
  };

  const openEditModal = () => {
    setFormData({
      payment_method_id: schedule.payment_method_id.toString(),
      payment_day: schedule.payment_day.toString(),
      send_reminder_email: schedule.send_reminder_email,
      reminder_days_before: schedule.reminder_days_before?.toString() || '3'
    });
    setShowSetupModal(true);
  };

  const getOrdinalSuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    if (!method) return 'Unknown';

    if (method.payment_type === 'card') {
      return `${method.card_brand} ending in ${method.card_last_four}`;
    } else {
      return `${method.bank_name || 'Bank account'} ending in ${method.account_last_four}`;
    }
  };

  if (loading) {
    return (
      <Layout title="Auto-Pay Settings">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading auto-pay settings...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Auto-Pay Settings">
      <div className="autopay-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>🔄 Auto-Pay Settings</h1>
            <p className="page-subtitle">Automatically pay your rent each month</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')} className="btn-close">×</button>
          </div>
        )}

        {/* Auto-Pay Status */}
        {schedule ? (
          /* Active Auto-Pay */
          <div className="autopay-active-section">
            <div className="status-card active">
              <div className="status-icon">✅</div>
              <div className="status-content">
                <h2>Auto-Pay is Active</h2>
                <p>Your rent will be automatically paid each month</p>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="section-card">
              <div className="section-header">
                <h3>📋 Schedule Details</h3>
                <button
                  onClick={openEditModal}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
              </div>
              <div className="section-content">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Payment Day:</span>
                    <span className="info-value">
                      {schedule.payment_day}{getOrdinalSuffix(schedule.payment_day)} of each month
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Payment Method:</span>
                    <span className="info-value">
                      {schedule.payment_method ? (
                        <span>
                          {schedule.payment_method.payment_type === 'card' ? '💳' : '🏦'}{' '}
                          {getPaymentMethodDisplay(schedule.payment_method)}
                        </span>
                      ) : (
                        'Unknown'
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email Reminders:</span>
                    <span className="info-value">
                      {schedule.send_reminder_email ? (
                        <span>
                          ✅ Enabled ({schedule.reminder_days_before} days before)
                        </span>
                      ) : (
                        <span>❌ Disabled</span>
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value">
                      <span className="badge badge-success">{schedule.status}</span>
                    </span>
                  </div>
                  {schedule.next_payment_date && (
                    <div className="info-item">
                      <span className="info-label">Next Payment:</span>
                      <span className="info-value">
                        {new Date(schedule.next_payment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Benefits Reminder */}
            <div className="benefits-card">
              <h3>💡 Auto-Pay Benefits</h3>
              <ul className="benefits-list">
                <li>✅ Never miss a payment</li>
                <li>✅ Avoid late fees</li>
                <li>✅ No need to remember due dates</li>
                <li>✅ Build positive payment history</li>
                <li>✅ Optional email reminders before payment</li>
              </ul>
            </div>

            {/* Cancel Button */}
            <div className="danger-zone">
              <h3>⚠️ Danger Zone</h3>
              <p>
                Canceling auto-pay means you'll need to manually make rent payments each month.
                Make sure you don't miss any payments to avoid late fees.
              </p>
              <button
                onClick={handleCancel}
                className="btn btn-danger"
              >
                Cancel Auto-Pay
              </button>
            </div>
          </div>
        ) : (
          /* No Auto-Pay Setup */
          <div className="autopay-inactive-section">
            <div className="status-card inactive">
              <div className="status-icon">⏸️</div>
              <div className="status-content">
                <h2>Auto-Pay is Not Active</h2>
                <p>Set up automatic payments to never miss rent again</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="benefits-card highlight">
              <h3>🌟 Why Use Auto-Pay?</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <div className="benefit-icon">⏰</div>
                  <h4>Save Time</h4>
                  <p>No need to log in and make manual payments every month</p>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">💰</div>
                  <h4>Avoid Late Fees</h4>
                  <p>Automatic payments ensure you never miss a due date</p>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">📧</div>
                  <h4>Get Reminders</h4>
                  <p>Optional email notifications before each payment</p>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🔒</div>
                  <h4>Secure & Safe</h4>
                  <p>Your payment information is encrypted and protected</p>
                </div>
              </div>
            </div>

            {/* Setup Button */}
            {paymentMethods.length > 0 ? (
              <div className="cta-section">
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="btn btn-primary btn-lg"
                >
                  Set Up Auto-Pay Now
                </button>
                <p className="cta-subtitle">Takes less than 2 minutes to configure</p>
              </div>
            ) : (
              <div className="alert alert-info">
                <strong>📝 Action Required</strong>
                <p>
                  You need to add a payment method before setting up auto-pay.
                </p>
                <a href="/tenant/payment-methods" className="btn btn-primary">
                  Add Payment Method
                </a>
              </div>
            )}

            {/* How It Works */}
            <div className="section-card">
              <div className="section-header">
                <h3>ℹ️ How Auto-Pay Works</h3>
              </div>
              <div className="section-content">
                <ol className="steps-list">
                  <li>
                    <strong>Choose a payment method:</strong> Select which card or bank account to use
                  </li>
                  <li>
                    <strong>Pick a payment day:</strong> Choose which day of the month to process payment
                  </li>
                  <li>
                    <strong>Set up reminders (optional):</strong> Get email notifications before payment
                  </li>
                  <li>
                    <strong>Relax:</strong> We'll automatically process your rent payment each month
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Setup/Edit Modal */}
        {showSetupModal && (
          <div className="modal-overlay" onClick={() => setShowSetupModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{schedule ? 'Update Auto-Pay' : 'Set Up Auto-Pay'}</h2>
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="btn-close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={schedule ? handleUpdate : handleSetup}>
                <div className="modal-body">
                  {/* Payment Method Selection */}
                  <div className="form-group">
                    <label htmlFor="payment_method_id">Payment Method *</label>
                    <select
                      id="payment_method_id"
                      name="payment_method_id"
                      value={formData.payment_method_id}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select a payment method</option>
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.payment_type === 'card' ? '💳' : '🏦'}{' '}
                          {getPaymentMethodDisplay(method)}
                          {method.is_default ? ' (Default)' : ''}
                        </option>
                      ))}
                    </select>
                    <small className="form-help">
                      The payment method that will be charged each month
                    </small>
                  </div>

                  {/* Payment Day */}
                  <div className="form-group">
                    <label htmlFor="payment_day">Payment Day *</label>
                    <select
                      id="payment_day"
                      name="payment_day"
                      value={formData.payment_day}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day}{getOrdinalSuffix(day)} of each month
                        </option>
                      ))}
                    </select>
                    <small className="form-help">
                      Choose the day of the month to automatically process payment
                    </small>
                  </div>

                  {/* Email Reminder */}
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="send_reminder_email"
                        checked={formData.send_reminder_email}
                        onChange={handleInputChange}
                      />
                      Send email reminder before payment
                    </label>
                  </div>

                  {/* Reminder Days */}
                  {formData.send_reminder_email && (
                    <div className="form-group">
                      <label htmlFor="reminder_days_before">Remind me</label>
                      <select
                        id="reminder_days_before"
                        name="reminder_days_before"
                        value={formData.reminder_days_before}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="1">1 day before</option>
                        <option value="2">2 days before</option>
                        <option value="3">3 days before</option>
                        <option value="5">5 days before</option>
                        <option value="7">7 days before</option>
                      </select>
                    </div>
                  )}

                  {/* Important Notice */}
                  <div className="alert alert-info">
                    <strong>ℹ️ Important:</strong>
                    <ul>
                      <li>Ensure sufficient funds are available on the payment day</li>
                      <li>You can update or cancel auto-pay anytime</li>
                      <li>Failed payments will be retried once automatically</li>
                      <li>You'll receive confirmation emails for each payment</li>
                    </ul>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(false)}
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
                    {submitting ? 'Saving...' : schedule ? 'Update Auto-Pay' : 'Activate Auto-Pay'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TenantAutoPay;
