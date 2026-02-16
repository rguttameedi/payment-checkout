import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FlexiblePaymentPlans.css';

function FlexiblePaymentPlans() {
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [leases, setLeases] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    leaseId: '',
    paymentMethodId: '',
    planName: '',
    frequency: 'weekly',
    startDate: new Date().toISOString().split('T')[0],
    paymentDayOfWeek: new Date().getDay(),
    autoPayEnabled: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch plans
      const plansRes = await fetch('/api/flexible-payment/plans', { headers });
      const plansData = await plansRes.json();

      if (plansData.success) {
        setPlans(plansData.data.plans);
      }

      // Fetch upcoming payments
      const upcomingRes = await fetch('/api/flexible-payment/upcoming?limit=10', { headers });
      const upcomingData = await upcomingRes.json();

      if (upcomingData.success) {
        setUpcomingPayments(upcomingData.data.upcomingPayments);
      }

      // Fetch payment methods
      const pmRes = await fetch('/api/tenant/payment-methods', { headers });
      const pmData = await pmRes.json();

      if (pmData.success) {
        setPaymentMethods(pmData.data.paymentMethods.filter(pm => pm.status === 'active'));
      }

      // Fetch leases
      const leasesRes = await fetch('/api/tenant/leases', { headers });
      const leasesData = await leasesRes.json();

      if (leasesData.success) {
        setLeases(leasesData.data.leases.filter(l => l.status === 'active'));
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load flexible payment plans');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/flexible-payment/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Flexible payment plan created successfully!');
        setShowCreateForm(false);
        setFormData({
          leaseId: '',
          paymentMethodId: '',
          planName: '',
          frequency: 'weekly',
          startDate: new Date().toISOString().split('T')[0],
          paymentDayOfWeek: new Date().getDay(),
          autoPayEnabled: true
        });
        fetchData();
      } else {
        setError(data.error || 'Failed to create plan');
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      setError('Failed to create flexible payment plan');
    }
  };

  const handlePausePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to pause this payment plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/flexible-payment/pause/${planId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Plan paused successfully');
        fetchData();
      } else {
        setError(data.error || 'Failed to pause plan');
      }
    } catch (err) {
      console.error('Error pausing plan:', err);
      setError('Failed to pause plan');
    }
  };

  const handleResumePlan = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/flexible-payment/resume/${planId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Plan resumed successfully');
        fetchData();
      } else {
        setError(data.error || 'Failed to resume plan');
      }
    } catch (err) {
      console.error('Error resuming plan:', err);
      setError('Failed to resume plan');
    }
  };

  const handleCancelPlan = async (planId) => {
    if (!window.confirm('Are you sure you want to cancel this payment plan? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/flexible-payment/cancel/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Plan cancelled successfully');
        fetchData();
      } else {
        setError(data.error || 'Failed to cancel plan');
      }
    } catch (err) {
      console.error('Error cancelling plan:', err);
      setError('Failed to cancel plan');
    }
  };

  const handleProcessPayment = async (scheduleId) => {
    if (!window.confirm('Process this payment now?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/flexible-payment/process-payment/${scheduleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Payment processed successfully! Transaction ID: ${data.data.transactionId}`);
        fetchData();
      } else {
        setError(data.error || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentMethodDisplay = (pm) => {
    if (pm.payment_type === 'card') {
      return `${pm.card_brand} ****${pm.card_last_four}`;
    } else {
      return `Bank ****${pm.account_last_four}`;
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="flexible-payment-container">
        <div className="loading">Loading flexible payment plans...</div>
      </div>
    );
  }

  return (
    <div className="flexible-payment-container">
      <div className="page-header">
        <h1>Flexible Payment Plans</h1>
        <Link to="/tenant/dashboard" className="btn-back">← Back to Dashboard</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Info Box */}
      <div className="info-box">
        <h3>📅 About Flexible Payment Plans</h3>
        <p>
          Split your monthly rent into smaller, more manageable payments with weekly or biweekly schedules.
          Perfect for tenants who get paid every week or every two weeks.
        </p>
        <ul>
          <li><strong>Weekly:</strong> ~4 payments per month</li>
          <li><strong>Biweekly:</strong> ~2 payments per month</li>
          <li>Auto-pay enabled by default</li>
          <li>Email reminders before each payment</li>
        </ul>
      </div>

      {/* Create New Plan Button */}
      {!showCreateForm && (
        <button
          className="btn-primary create-plan-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Create New Flexible Payment Plan
        </button>
      )}

      {/* Create Plan Form */}
      {showCreateForm && (
        <div className="create-plan-form">
          <div className="form-header">
            <h2>Create Flexible Payment Plan</h2>
            <button
              className="btn-close"
              onClick={() => setShowCreateForm(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleCreatePlan}>
            <div className="form-group">
              <label htmlFor="planName">Plan Name *</label>
              <input
                type="text"
                id="planName"
                name="planName"
                value={formData.planName}
                onChange={handleInputChange}
                placeholder="e.g., Weekly Rent Payment"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="leaseId">Lease *</label>
              <select
                id="leaseId"
                name="leaseId"
                value={formData.leaseId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a lease</option>
                {leases.map(lease => (
                  <option key={lease.id} value={lease.id}>
                    Unit {lease.unit?.unit_number} - {formatCurrency(lease.monthly_rent)}/month
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethodId">Payment Method *</label>
              <select
                id="paymentMethodId"
                name="paymentMethodId"
                value={formData.paymentMethodId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {getPaymentMethodDisplay(pm)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequency">Payment Frequency *</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="weekly">Weekly (Every 7 days)</option>
                  <option value="biweekly">Biweekly (Every 14 days)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="form-group">
                <label htmlFor="paymentDayOfWeek">Payment Day of Week *</label>
                <select
                  id="paymentDayOfWeek"
                  name="paymentDayOfWeek"
                  value={formData.paymentDayOfWeek}
                  onChange={handleInputChange}
                  required
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="autoPayEnabled"
                  checked={formData.autoPayEnabled}
                  onChange={handleInputChange}
                />
                Enable automatic payments
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Plans */}
      {plans.length > 0 && (
        <div className="plans-section">
          <h2>Your Payment Plans</h2>
          <div className="plans-grid">
            {plans.map(plan => (
              <div key={plan.id} className={`plan-card ${plan.status}`}>
                <div className="plan-header">
                  <h3>{plan.plan_name}</h3>
                  <span className={`status-badge ${plan.status}`}>
                    {plan.status}
                  </span>
                </div>

                <div className="plan-details">
                  <div className="detail-row">
                    <span className="label">Frequency:</span>
                    <span className="value">{plan.frequency}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Amount:</span>
                    <span className="value">{formatCurrency(plan.payment_amount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Monthly Total:</span>
                    <span className="value">{formatCurrency(plan.total_monthly_amount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Next Payment:</span>
                    <span className="value">{formatDate(plan.next_payment_date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Method:</span>
                    <span className="value">{getPaymentMethodDisplay(plan.paymentMethod)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Auto-Pay:</span>
                    <span className="value">{plan.auto_pay_enabled ? '✓ Enabled' : '✗ Disabled'}</span>
                  </div>
                </div>

                <div className="plan-actions">
                  {plan.status === 'active' && (
                    <>
                      <button
                        className="btn-warning btn-small"
                        onClick={() => handlePausePlan(plan.id)}
                      >
                        Pause
                      </button>
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleCancelPlan(plan.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {plan.status === 'paused' && (
                    <>
                      <button
                        className="btn-success btn-small"
                        onClick={() => handleResumePlan(plan.id)}
                      >
                        Resume
                      </button>
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleCancelPlan(plan.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="upcoming-section">
          <h2>Upcoming Payments</h2>
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.scheduled_date)}</td>
                    <td>{payment.plan.plan_name}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      {payment.status === 'scheduled' && (
                        <button
                          className="btn-primary btn-small"
                          onClick={() => handleProcessPayment(payment.id)}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {plans.length === 0 && !showCreateForm && (
        <div className="empty-state">
          <h3>No Flexible Payment Plans Yet</h3>
          <p>Create your first flexible payment plan to split your rent into smaller payments.</p>
        </div>
      )}
    </div>
  );
}

export default FlexiblePaymentPlans;
