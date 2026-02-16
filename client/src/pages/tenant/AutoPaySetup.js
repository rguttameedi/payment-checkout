import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedWalletDropdown from '../../components/wallet/SharedWalletDropdown';
import './AutoPaySetup.css';

const AutoPaySetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [autopaySchedule, setAutopaySchedule] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentDay, setPaymentDay] = useState(1);
  const [showSetupForm, setShowSetupForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

      // Fetch AutoPay schedule
      const autopayRes = await fetch('http://localhost:50155/api/autopay/schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const autopayData = await autopayRes.json();
      setAutopaySchedule(autopayData.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSetupAutoPay = async () => {
    try {
      if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:50155/api/autopay/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leaseId: dashboardData.lease.id,
          paymentMethodId: selectedPaymentMethod,
          paymentDay: paymentDay,
          amount: dashboardData.lease.monthly_rent,
          scheduleType: 'monthly'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('AutoPay set up successfully!');
        fetchData();
        setShowSetupForm(false);
      } else {
        alert('Failed to set up AutoPay: ' + result.error);
      }
    } catch (error) {
      console.error('Error setting up AutoPay:', error);
      alert('Failed to set up AutoPay');
    }
  };

  const handleCancelAutoPay = async () => {
    if (!window.confirm('Are you sure you want to cancel AutoPay?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:50155/api/autopay/cancel', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        alert('AutoPay cancelled successfully');
        fetchData();
      } else {
        alert('Failed to cancel AutoPay: ' + result.error);
      }
    } catch (error) {
      console.error('Error cancelling AutoPay:', error);
      alert('Failed to cancel AutoPay');
    }
  };

  if (loading) {
    return <div className="autopay-loading">Loading...</div>;
  }

  return (
    <div className="autopay-container">
      <div className="autopay-header">
        <h1>AutoPay Settings</h1>
        <p className="subtitle">Never miss a rent payment - set up automatic monthly payments</p>
      </div>

      {autopaySchedule?.autopayEnabled ? (
        /* AutoPay is Active */
        <div className="autopay-active">
          <div className="status-card">
            <div className="status-icon">✅</div>
            <div className="status-content">
              <h2>AutoPay is Active</h2>
              <p>Your rent will be paid automatically each month</p>
            </div>
          </div>

          <div className="schedule-details">
            <h3>Schedule Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Payment Amount</span>
                <span className="value">${autopaySchedule.schedule.amount}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Day</span>
                <span className="value">Day {autopaySchedule.schedule.paymentDay} of each month</span>
              </div>
              <div className="detail-item">
                <span className="label">Next Payment</span>
                <span className="value">
                  {new Date(autopaySchedule.schedule.nextPaymentDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Method</span>
                <span className="value">
                  {autopaySchedule.schedule.paymentMethod.card_brand || autopaySchedule.schedule.paymentMethod.bank_name}{' '}
                  ****{autopaySchedule.schedule.paymentMethod.card_last_four || autopaySchedule.schedule.paymentMethod.account_last_four}
                </span>
              </div>
            </div>
          </div>

          <div className="autopay-actions">
            <button className="btn btn-secondary" onClick={() => setShowSetupForm(true)}>
              Update AutoPay
            </button>
            <button className="btn btn-danger" onClick={handleCancelAutoPay}>
              Cancel AutoPay
            </button>
          </div>
        </div>
      ) : (
        /* AutoPay Not Set Up */
        <div className="autopay-setup">
          <div className="benefits-card">
            <h3>Benefits of AutoPay</h3>
            <ul>
              <li>✅ Never miss a payment deadline</li>
              <li>✅ Avoid late fees automatically</li>
              <li>✅ Set it and forget it convenience</li>
              <li>✅ Earn rewards points every month</li>
              <li>✅ Can cancel anytime</li>
            </ul>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowSetupForm(true)}
          >
            Set Up AutoPay
          </button>
        </div>
      )}

      {/* Setup/Edit Form Modal */}
      {showSetupForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Set Up AutoPay</h2>
              <button className="close-btn" onClick={() => setShowSetupForm(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Monthly Rent Amount</label>
                <div className="amount-display">${dashboardData?.lease?.monthly_rent || 0}</div>
              </div>

              <div className="form-group">
                <label>Payment Day (Day of Month)</label>
                <select
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(parseInt(e.target.value))}
                  className="form-control"
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                  ))}
                </select>
                <small>Choose when to automatically pay rent each month</small>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <SharedWalletDropdown
                  displayMode="compact"
                  paymentType="all"
                  onPaymentSelected={(payment) => {
                    console.log('Payment selected:', payment);
                    setSelectedPaymentMethod(payment.id);
                  }}
                />
                <small>Select the payment method to use for automatic payments</small>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowSetupForm(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSetupAutoPay}>
                  Enable AutoPay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoPaySetup;
