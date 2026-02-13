import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/Dashboard.css';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <Layout title="Admin Dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard">
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
      <Layout title="Admin Dashboard">
        <div className="alert alert-info">
          No data available
        </div>
      </Layout>
    );
  }

  const { overview, financial, recentPayments } = dashboardData.data;

  return (
    <Layout title="Admin Dashboard">
      <div className="dashboard-container admin">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>📊 Property Management Dashboard</h1>
          <p className="welcome-subtitle">
            Monitor your properties, tenants, and payments at a glance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>Total Properties</h3>
              <p className="stat-value">{overview?.totalProperties || 0}</p>
              <Link to="/admin/properties" className="stat-link">
                View all →
              </Link>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">🏠</div>
            <div className="stat-content">
              <h3>Total Units</h3>
              <p className="stat-value">{overview?.totalUnits || 0}</p>
              <p className="stat-label">
                {overview?.occupiedUnits || 0} occupied, {overview?.vacantUnits || 0} vacant
              </p>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Active Tenants</h3>
              <p className="stat-value">{overview?.totalTenants || 0}</p>
              <Link to="/admin/tenants" className="stat-link">
                View all →
              </Link>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Active Leases</h3>
              <p className="stat-value">{overview?.activeLeases || 0}</p>
              <Link to="/admin/leases" className="stat-link">
                View all →
              </Link>
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="section-card">
          <div className="section-header">
            <h2>📈 Occupancy Overview</h2>
          </div>
          <div className="section-content">
            <div className="occupancy-visual">
              <div className="occupancy-chart">
                <div className="chart-bar">
                  <div
                    className="chart-fill occupied"
                    style={{
                      width: `${overview?.occupancyRate || 0}%`
                    }}
                  >
                    <span className="chart-label">
                      {parseFloat(overview?.occupancyRate || 0).toFixed(1)}% Occupied
                    </span>
                  </div>
                </div>
              </div>
              <div className="occupancy-details">
                <div className="occupancy-item">
                  <span className="occupancy-color occupied"></span>
                  <span className="occupancy-text">
                    Occupied: {overview?.occupiedUnits || 0} units
                  </span>
                </div>
                <div className="occupancy-item">
                  <span className="occupancy-color vacant"></span>
                  <span className="occupancy-text">
                    Vacant: {overview?.vacantUnits || 0} units
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="stats-grid">
          <div className="stat-card financial">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Monthly Revenue</h3>
              <p className="stat-value">{formatCurrency(financial?.monthlyRevenue || 0)}</p>
              <p className="stat-label">
                {financial?.currentMonth || ''} {financial?.currentYear || ''}
              </p>
            </div>
          </div>

          <div className="stat-card financial">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Payments</h3>
              <p className="stat-value">{financial?.pendingPayments || 0}</p>
              <Link to="/admin/payments?status=pending" className="stat-link">
                View pending →
              </Link>
            </div>
          </div>

          <div className="stat-card financial">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Collection Rate</h3>
              <p className="stat-value">
                {financial?.collectionRate
                  ? `${parseFloat(financial.collectionRate).toFixed(1)}%`
                  : 'N/A'
                }
              </p>
              <p className="stat-label">This month</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-card">
          <div className="section-header">
            <h2>⚡ Quick Actions</h2>
          </div>
          <div className="section-content">
            <div className="action-buttons">
              <Link to="/admin/properties?action=create" className="btn btn-primary">
                <span className="btn-icon">+</span>
                Add Property
              </Link>
              <Link to="/admin/leases?action=create" className="btn btn-secondary">
                <span className="btn-icon">📝</span>
                Create Lease
              </Link>
              <Link to="/admin/tenants" className="btn btn-secondary">
                <span className="btn-icon">👥</span>
                Manage Tenants
              </Link>
              <Link to="/admin/payments" className="btn btn-secondary">
                <span className="btn-icon">💵</span>
                View All Payments
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        {recentPayments && recentPayments.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <h2>💳 Recent Payments</h2>
              <Link to="/admin/payments" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="section-content">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Tenant</th>
                      <th>Property/Unit</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.payment_date)}</td>
                        <td>
                          {payment.lease?.tenant ? (
                            <div>
                              <div className="tenant-name">
                                {payment.lease.tenant.first_name} {payment.lease.tenant.last_name}
                              </div>
                              <div className="tenant-email">
                                {payment.lease.tenant.email}
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {payment.lease?.unit ? (
                            <div>
                              <div className="property-name">
                                {payment.lease.unit.property?.name || 'N/A'}
                              </div>
                              <div className="unit-number">
                                Unit {payment.lease.unit.unit_number}
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="amount">{formatCurrency(payment.total_amount)}</td>
                        <td>{getPaymentStatusBadge(payment.payment_status)}</td>
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

        {/* Property Status Distribution */}
        <div className="section-card">
          <div className="section-header">
            <h2>🏠 Unit Status Distribution</h2>
          </div>
          <div className="section-content">
            <div className="status-distribution">
              <div className="status-item">
                <div className="status-icon occupied">🏠</div>
                <div className="status-details">
                  <div className="status-label">Occupied</div>
                  <div className="status-value">{overview?.occupiedUnits || 0}</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon vacant">🏚️</div>
                <div className="status-details">
                  <div className="status-label">Vacant</div>
                  <div className="status-value">{overview?.vacantUnits || 0}</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon maintenance">🔧</div>
                <div className="status-details">
                  <div className="status-label">Maintenance</div>
                  <div className="status-value">{overview?.maintenanceUnits || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts and Notifications */}
        {financial?.pendingPayments > 0 && (
          <div className="alert alert-warning">
            <strong>⚠️ Attention Required:</strong>
            <p>
              You have {financial.pendingPayments} pending payment{financial.pendingPayments !== 1 ? 's' : ''} awaiting collection.
            </p>
            <Link to="/admin/payments?status=pending" className="btn btn-primary btn-sm">
              View Pending Payments
            </Link>
          </div>
        )}

        {overview?.vacantUnits > 0 && (
          <div className="alert alert-info">
            <strong>ℹ️ Marketing Opportunity:</strong>
            <p>
              You have {overview.vacantUnits} vacant unit{overview.vacantUnits !== 1 ? 's' : ''} available for leasing.
            </p>
            <Link to="/admin/properties" className="btn btn-secondary btn-sm">
              View Properties
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Helper function to get month name
function getMonthName(monthNumber) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
}

export default AdminDashboard;
