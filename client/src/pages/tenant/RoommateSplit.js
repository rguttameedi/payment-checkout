import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedWalletDropdown from '../../components/wallet/SharedWalletDropdown';
import './RoommateSplit.css';

const RoommateSplit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedShare, setSelectedShare] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Form state
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentMonth, setPaymentMonth] = useState(new Date().getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear());
  const [dueDate, setDueDate] = useState('');
  const [roommates, setRoommates] = useState([
    { name: '', email: '', shareAmount: '' }
  ]);

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

      // Fetch active plans
      const plansRes = await fetch('http://localhost:50155/api/roommate-split/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const plansData = await plansRes.json();
      setActivePlans(plansData.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddRoommate = () => {
    if (roommates.length < 5) {
      setRoommates([...roommates, { name: '', email: '', shareAmount: '' }]);
    }
  };

  const handleRemoveRoommate = (index) => {
    const newRoommates = roommates.filter((_, i) => i !== index);
    setRoommates(newRoommates);
  };

  const handleRoommateChange = (index, field, value) => {
    const newRoommates = [...roommates];
    newRoommates[index][field] = value;
    setRoommates(newRoommates);
  };

  const handleCreatePlan = async () => {
    try {
      // Validate
      if (!totalAmount || parseFloat(totalAmount) <= 0) {
        alert('Please enter a valid total amount');
        return;
      }

      if (!dueDate) {
        alert('Please select a due date');
        return;
      }

      // Validate roommates
      for (const roommate of roommates) {
        if (!roommate.name || !roommate.email || !roommate.shareAmount) {
          alert('Please fill in all roommate details');
          return;
        }
      }

      // Check total shares
      const totalShares = roommates.reduce((sum, r) => sum + parseFloat(r.shareAmount), 0);
      if (Math.abs(totalShares - parseFloat(totalAmount)) > 0.01) {
        alert(`Sum of shares ($${totalShares.toFixed(2)}) must equal total amount ($${parseFloat(totalAmount).toFixed(2)})`);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:50155/api/roommate-split/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leaseId: dashboardData.lease.id,
          totalAmount: parseFloat(totalAmount),
          paymentMonth: parseInt(paymentMonth),
          paymentYear: parseInt(paymentYear),
          dueDate: dueDate,
          roommates: roommates.map(r => ({
            name: r.name,
            email: r.email,
            shareAmount: parseFloat(r.shareAmount)
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Roommate split plan created successfully!');
        setShowSetupModal(false);
        resetForm();
        fetchData();
      } else {
        alert('Failed to create plan: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan');
    }
  };

  const handlePayShare = async () => {
    try {
      if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:50155/api/roommate-split/pay-share', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shareId: selectedShare.id,
          paymentMethodId: selectedPaymentMethod
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Payment processed successfully!');
        setShowPaymentModal(false);
        setSelectedShare(null);
        setSelectedPaymentMethod(null);
        fetchData();
      } else {
        alert('Failed to process payment: ' + result.error);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    }
  };

  const handleSendReminder = async (shareId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:50155/api/roommate-split/send-reminder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shareId })
      });

      const result = await response.json();

      if (result.success) {
        alert('Reminder sent successfully!');
      } else {
        alert('Failed to send reminder: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
  };

  const handleCancelPlan = async (planId) => {
    if (!window.confirm('Are you sure you want to cancel this split plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:50155/api/roommate-split/cancel/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        alert('Plan cancelled successfully');
        fetchData();
      } else {
        alert('Failed to cancel plan: ' + result.error);
      }
    } catch (error) {
      console.error('Error cancelling plan:', error);
      alert('Failed to cancel plan');
    }
  };

  const resetForm = () => {
    setTotalAmount('');
    setPaymentMonth(new Date().getMonth() + 1);
    setPaymentYear(new Date().getFullYear());
    setDueDate('');
    setRoommates([{ name: '', email: '', shareAmount: '' }]);
  };

  const openPaymentModal = (share) => {
    setSelectedShare(share);
    setShowPaymentModal(true);
  };

  if (loading) {
    return <div className="roommate-split-loading">Loading...</div>;
  }

  return (
    <div className="roommate-split-container">
      <div className="roommate-split-header">
        <h1>Split with Roommates</h1>
        <p className="subtitle">Share rent payments with your roommates easily</p>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <div className="benefit-card">
          <div className="benefit-icon">👥</div>
          <h3>Easy Splitting</h3>
          <p>Divide rent between roommates with custom amounts</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-icon">📧</div>
          <h3>Email Reminders</h3>
          <p>Send payment reminders to roommates who haven't paid</p>
        </div>
        <div className="benefit-card">
          <div className="benefit-icon">✅</div>
          <h3>Track Progress</h3>
          <p>See who has paid and who still owes their share</p>
        </div>
      </div>

      {/* Active Plans */}
      {activePlans.length > 0 && (
        <div className="active-plans-section">
          <h2>Active Split Plans</h2>
          {activePlans.map(plan => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <h3>{new Date(plan.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Rent Split</h3>
                <span className={`status-badge status-${plan.status}`}>{plan.status}</span>
              </div>

              <div className="plan-details">
                <div className="detail">
                  <span className="label">Total Amount</span>
                  <span className="value">${parseFloat(plan.total_amount).toFixed(2)}</span>
                </div>
                <div className="detail">
                  <span className="label">Due Date</span>
                  <span className="value">{new Date(plan.due_date).toLocaleDateString()}</span>
                </div>
                <div className="detail">
                  <span className="label">Roommates</span>
                  <span className="value">{plan.number_of_roommates}</span>
                </div>
                <div className="detail">
                  <span className="label">Status</span>
                  <span className="value">
                    {plan.shares.filter(s => s.status === 'paid').length} / {plan.shares.length} Paid
                  </span>
                </div>
              </div>

              <div className="roommates-list">
                <h4>Roommate Shares</h4>
                {plan.shares.map(share => (
                  <div key={share.id} className={`roommate-item status-${share.status}`}>
                    <div className="roommate-info">
                      <div className="roommate-name">{share.roommate_name}</div>
                      <div className="roommate-email">{share.roommate_email}</div>
                    </div>
                    <div className="roommate-amount">${parseFloat(share.share_amount).toFixed(2)}</div>
                    <div className="roommate-actions">
                      {share.status === 'pending' ? (
                        <>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openPaymentModal(share)}
                          >
                            Pay My Share
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleSendReminder(share.id)}
                          >
                            Send Reminder
                          </button>
                        </>
                      ) : (
                        <span className={`status-badge status-${share.status}`}>
                          {share.status === 'paid' ? '✅ Paid' : share.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {plan.status === 'active' && (
                <div className="plan-actions">
                  <button
                    className="btn btn-text btn-danger-text"
                    onClick={() => handleCancelPlan(plan.id)}
                  >
                    Cancel Plan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Setup Button */}
      <div className="setup-section">
        <button
          className="btn btn-primary btn-large"
          onClick={() => setShowSetupModal(true)}
        >
          Create New Split Plan
        </button>
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Roommate Split Plan</h2>
              <button className="close-btn" onClick={() => setShowSetupModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Total Rent Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="Enter total rent amount"
                  step="0.01"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Month</label>
                  <select
                    className="form-control"
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Year</label>
                  <select
                    className="form-control"
                    value={paymentYear}
                    onChange={(e) => setPaymentYear(e.target.value)}
                  >
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Roommates (excluding you)</label>
                {roommates.map((roommate, index) => (
                  <div key={index} className="roommate-input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name"
                      value={roommate.name}
                      onChange={(e) => handleRoommateChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={roommate.email}
                      onChange={(e) => handleRoommateChange(index, 'email', e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Share Amount"
                      value={roommate.shareAmount}
                      onChange={(e) => handleRoommateChange(index, 'shareAmount', e.target.value)}
                      step="0.01"
                    />
                    {roommates.length > 1 && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveRoommate(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {roommates.length < 5 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddRoommate}
                  >
                    + Add Roommate
                  </button>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowSetupModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreatePlan}>
                  Create Split Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedShare && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Pay Your Share</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Amount to Pay</label>
                <div className="amount-display">${parseFloat(selectedShare.share_amount).toFixed(2)}</div>
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
                <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handlePayShare}>
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoommateSplit;
