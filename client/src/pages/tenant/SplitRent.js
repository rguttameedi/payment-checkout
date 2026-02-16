import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedWalletDropdown from '../../components/wallet/SharedWalletDropdown';
import './SplitRent.css';

const SplitRent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);

  // Setup form state
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [numberOfSplits, setNumberOfSplits] = useState(2);
  const [installmentDates, setInstallmentDates] = useState(['', '']);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Update installment dates array when number of splits changes
    const newDates = Array(numberOfSplits).fill('');
    setInstallmentDates(newDates);
  }, [numberOfSplits]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch dashboard data
      const dashboardRes = await fetch('http://localhost:50155/api/tenant/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dashboardData = await dashboardRes.json();
      setDashboardData(dashboardData.data);

      // Fetch active split plans
      const plansRes = await fetch('http://localhost:50155/api/split-payment/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const plansData = await plansRes.json();
      setActivePlans(plansData.data || []);

      // Fetch upcoming installments
      const upcomingRes = await fetch('http://localhost:50155/api/split-payment/upcoming', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const upcomingData = await upcomingRes.json();
      setUpcomingInstallments(upcomingData.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateSplitPlan = async () => {
    try {
      if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
      }

      // Validate all dates are filled
      if (installmentDates.some(date => !date)) {
        alert('Please select dates for all installments');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:50155/api/split-payment/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leaseId: dashboardData.lease.id,
          paymentMethodId: selectedPaymentMethod,
          totalAmount: dashboardData.lease.monthly_rent,
          numberOfSplits: numberOfSplits,
          installmentDates: installmentDates
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Split payment plan created! Your rent will be divided into ${numberOfSplits} payments.`);
        setShowSetupForm(false);
        fetchData();
      } else {
        alert('Failed to create split payment plan: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating split payment plan:', error);
      alert('Failed to create split payment plan');
    }
  };

  const handlePayInstallment = async (installmentId) => {
    if (!window.confirm('Process this installment payment now?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:50155/api/split-payment/process-installment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ installmentId })
      });

      const result = await response.json();

      if (result.success) {
        alert('Installment payment processed successfully!');
        fetchData();
      } else {
        alert('Failed to process payment: ' + result.error);
      }
    } catch (error) {
      console.error('Error processing installment:', error);
      alert('Failed to process installment payment');
    }
  };

  const handleCancelPlan = async (planId) => {
    if (!window.confirm('Cancel this split payment plan? Pending installments will be cancelled.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:50155/api/split-payment/cancel/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        alert('Split payment plan cancelled successfully');
        fetchData();
      } else {
        alert('Failed to cancel plan: ' + result.error);
      }
    } catch (error) {
      console.error('Error cancelling plan:', error);
      alert('Failed to cancel split payment plan');
    }
  };

  if (loading) {
    return <div className="split-rent-loading">Loading...</div>;
  }

  const rentAmount = dashboardData?.lease?.monthly_rent || 0;

  return (
    <div className="split-rent-container">
      <div className="split-rent-header">
        <h1>Split Rent Payments</h1>
        <p className="subtitle">Divide your rent into multiple payments on dates you choose</p>
      </div>

      {/* Benefits Section */}
      {activePlans.length === 0 && (
        <div className="benefits-section">
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Manage Cash Flow</h3>
            <p>Split your rent into 2-4 payments aligned with your paydays</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📅</div>
            <h3>Choose Your Dates</h3>
            <p>Select the exact dates for each payment installment</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">✅</div>
            <h3>No Extra Fees</h3>
            <p>Split payments at no additional cost - we've got your back!</p>
          </div>
        </div>
      )}

      {/* Active Split Plans */}
      {activePlans.length > 0 && (
        <div className="active-plans-section">
          <h2>Active Split Plans</h2>
          {activePlans.map(plan => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <h3>
                  {plan.number_of_splits}-Payment Plan for {new Date(0, plan.payment_month - 1).toLocaleString('default', { month: 'long' })} {plan.payment_year}
                </h3>
                <button
                  className="btn-text btn-danger-text"
                  onClick={() => handleCancelPlan(plan.id)}
                >
                  Cancel Plan
                </button>
              </div>
              <div className="plan-details">
                <div className="detail">
                  <span className="label">Total Amount:</span>
                  <span className="value">${plan.total_amount}</span>
                </div>
                <div className="detail">
                  <span className="label">Per Installment:</span>
                  <span className="value">${plan.amount_per_split}</span>
                </div>
              </div>
              <div className="installments-list">
                {plan.SplitPaymentInstallments.map(inst => (
                  <div key={inst.id} className={`installment-item status-${inst.status}`}>
                    <div className="installment-info">
                      <span className="installment-number">Payment {inst.installment_number}</span>
                      <span className="installment-date">
                        {new Date(inst.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="installment-amount">${inst.amount}</span>
                    </div>
                    <div className="installment-status">
                      {inst.status === 'pending' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handlePayInstallment(inst.id)}
                        >
                          Pay Now
                        </button>
                      )}
                      {inst.status === 'completed' && (
                        <span className="status-badge status-completed">✓ Paid</span>
                      )}
                      {inst.status === 'failed' && (
                        <span className="status-badge status-failed">✗ Failed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Installments */}
      {upcomingInstallments.length > 0 && (
        <div className="upcoming-section">
          <h2>Upcoming Payments</h2>
          {upcomingInstallments.slice(0, 3).map(inst => (
            <div key={inst.id} className="upcoming-item">
              <div className="upcoming-date">
                <div className="date-day">{new Date(inst.scheduled_date).getDate()}</div>
                <div className="date-month">
                  {new Date(inst.scheduled_date).toLocaleString('default', { month: 'short' })}
                </div>
              </div>
              <div className="upcoming-details">
                <div className="upcoming-title">Installment {inst.installment_number}</div>
                <div className="upcoming-amount">${inst.amount}</div>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handlePayInstallment(inst.id)}
              >
                Pay Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Setup Button */}
      {activePlans.length === 0 && (
        <div className="setup-section">
          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowSetupForm(true)}
          >
            Set Up Split Payments
          </button>
        </div>
      )}

      {/* Setup Form Modal */}
      {showSetupForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Set Up Split Rent Payments</h2>
              <button className="close-btn" onClick={() => setShowSetupForm(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Monthly Rent</label>
                <div className="amount-display">${rentAmount}</div>
              </div>

              <div className="form-group">
                <label>Number of Payments</label>
                <div className="split-options">
                  {[2, 3, 4].map(num => (
                    <button
                      key={num}
                      className={`split-option ${numberOfSplits === num ? 'selected' : ''}`}
                      onClick={() => setNumberOfSplits(num)}
                    >
                      <div className="option-number">{num}</div>
                      <div className="option-label">Payments</div>
                      <div className="option-amount">${(rentAmount / num).toFixed(2)} each</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Select Payment Dates</label>
                {installmentDates.map((date, index) => (
                  <div key={index} className="date-input-group">
                    <span className="date-label">Payment {index + 1}:</span>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => {
                        const newDates = [...installmentDates];
                        newDates[index] = e.target.value;
                        setInstallmentDates(newDates);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <SharedWalletDropdown
                  displayMode="compact"
                  paymentType="all"
                  onPaymentSelected={(payment) => {
                    setSelectedPaymentMethod(payment.id);
                  }}
                />
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowSetupForm(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateSplitPlan}>
                  Create Split Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitRent;
