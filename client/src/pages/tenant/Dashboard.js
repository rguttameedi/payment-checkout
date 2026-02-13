import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tenantService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/Dashboard.css';

function TenantDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-error',
      processing: 'badge-info'
    };
    return (
      <span className={`badge ${statusClasses[status] || 'badge-default'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout title="Tenant Dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Tenant Dashboard">
        <div className="alert alert-error">
          {error}
          <button onClick={fetchDashboardData} className="btn btn-sm">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout title="Tenant Dashboard">
        <div className="alert alert-info">
          No data available
        </div>
      </Layout>
    );
  }

  const { lease, nextPayment, recentPayments, autoPayEnabled } = dashboardData.data;

  return (
    <Layout title="Tenant Dashboard">
      <div className="dashboard-container">
        {/* Quick Stats Cards */}
        <div className="stats-grid">
          {/* Next Payment Card */}
          <div className="stat-card highlight">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Next Payment</h3>
              {nextPayment ? (
                <>
                  <p className="stat-value">{formatCurrency(nextPayment.amount)}</p>
                  <p className="stat-label">
                    Due {formatDate(nextPayment.dueDate)}
                  </p>
                  {nextPayment.daysUntilDue !== undefined && (
                    <p className="stat-sublabel">
                      {nextPayment.daysUntilDue > 0
                        ? `${nextPayment.daysUntilDue} days remaining`
                        : nextPayment.daysUntilDue === 0
                        ? 'Due today!'
                        : `${Math.abs(nextPayment.daysUntilDue)} days overdue`
                      }
                    </p>
                  )}
                </>
              ) : (
                <p className="stat-value">All paid!</p>
              )}
            </div>
          </div>

          {/* Monthly Rent Card */}
          <div className="stat-card">
            <div className="stat-icon">🏠</div>
            <div className="stat-content">
              <h3>Monthly Rent</h3>
              <p className="stat-value">
                {lease ? formatCurrency(lease.monthlyRent) : 'N/A'}
              </p>
              <p className="stat-label">
                {lease?.unit?.unit_number || 'No unit assigned'}
              </p>
            </div>
          </div>

          {/* Auto-Pay Status Card */}
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h3>Auto-Pay</h3>
              <p className="stat-value">
                {autoPayEnabled ? (
                  <span className="text-success">Enabled</span>
                ) : (
                  <span className="text-muted">Disabled</span>
                )}
              </p>
              <Link to="/tenant/auto-pay" className="stat-link">
                {autoPayEnabled ? 'Manage' : 'Set up now'}
              </Link>
            </div>
          </div>

          {/* Lease Status Card */}
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Lease Status</h3>
              <p className="stat-value">
                {lease ? (
                  <span className="badge badge-success">{lease.status}</span>
                ) : (
                  <span className="badge badge-default">No lease</span>
                )}
              </p>
              {lease && (
                <p className="stat-label">
                  Ends {formatDate(lease.leaseEndDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lease Details Section */}
        {lease && (
          <div className="section-card">
            <div className="section-header">
              <h2>🏢 Your Lease</h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Property:</span>
                  <span className="info-value">
                    {lease.unit?.property?.name || 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Unit:</span>
                  <span className="info-value">{lease.unit?.unit_number || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address:</span>
                  <span className="info-value">
                    {lease.unit?.property?.address_line1 || 'N/A'}, {lease.unit?.property?.city || ''} {lease.unit?.property?.state || ''} {lease.unit?.property?.zip_code || ''}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Monthly Rent:</span>
                  <span className="info-value">{formatCurrency(lease.monthlyRent)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Lease Start:</span>
                  <span className="info-value">{formatDate(lease.leaseStartDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Lease End:</span>
                  <span className="info-value">{formatDate(lease.leaseEndDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rent Due Day:</span>
                  <span className="info-value">
                    {lease.rent_due_day ? `${lease.rent_due_day}${getOrdinalSuffix(lease.rent_due_day)} of each month` : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Security Deposit:</span>
                  <span className="info-value">{formatCurrency(lease.security_deposit)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="section-card">
          <div className="section-header">
            <h2>⚡ Quick Actions</h2>
          </div>
          <div className="section-content">
            <div className="action-buttons">
              <Link to="/tenant/payments" className="btn btn-primary">
                <span className="btn-icon">💳</span>
                Make a Payment
              </Link>
              <Link to="/tenant/payment-methods" className="btn btn-secondary">
                <span className="btn-icon">💰</span>
                Manage Payment Methods
              </Link>
              <Link to="/tenant/auto-pay" className="btn btn-secondary">
                <span className="btn-icon">🔄</span>
                {autoPayEnabled ? 'Update Auto-Pay' : 'Set Up Auto-Pay'}
              </Link>
              <Link to="/tenant/payments" className="btn btn-secondary">
                <span className="btn-icon">📊</span>
                View Payment History
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        {recentPayments && recentPayments.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <h2>📋 Recent Payments</h2>
              <Link to="/tenant/payments" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="section-content">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment Method</th>
                      <th>Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.payment_date)}</td>
                        <td className="amount">{formatCurrency(payment.total_amount)}</td>
                        <td>{getPaymentStatusBadge(payment.payment_status)}</td>
                        <td>
                          {payment.payment_method?.nickname ||
                           payment.payment_method?.payment_type ||
                           'N/A'}
                        </td>
                        <td>
                          {payment.payment_month && payment.payment_year
                            ? `${getMonthName(payment.payment_month)} ${payment.payment_year}`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        {nextPayment && nextPayment.daysUntilDue < 5 && nextPayment.daysUntilDue >= 0 && (
          <div className="alert alert-warning">
            <strong>⚠️ Payment Due Soon!</strong>
            <p>
              Your rent payment of {formatCurrency(nextPayment.amount)} is due in {nextPayment.daysUntilDue} day{nextPayment.daysUntilDue !== 1 ? 's' : ''}.
              {!autoPayEnabled && ' Consider setting up auto-pay to never miss a payment!'}
            </p>
          </div>
        )}

        {nextPayment && nextPayment.daysUntilDue < 0 && (
          <div className="alert alert-error">
            <strong>🚨 Payment Overdue!</strong>
            <p>
              Your rent payment of {formatCurrency(nextPayment.amount)} is {Math.abs(nextPayment.daysUntilDue)} day{Math.abs(nextPayment.daysUntilDue) !== 1 ? 's' : ''} overdue.
              Please make a payment as soon as possible to avoid late fees.
            </p>
            <Link to="/tenant/payments" className="btn btn-primary btn-sm">
              Pay Now
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Helper function to get month name from number
function getMonthName(monthNumber) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
}

export default TenantDashboard;
