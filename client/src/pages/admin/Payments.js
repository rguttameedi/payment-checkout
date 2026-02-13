import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/Payments.css';

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    property_id: '',
    year: new Date().getFullYear().toString(),
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPayments(filters);
      setPayments(response.data.data?.payments || []);
      setPagination(response.data.data?.pagination || { total: 0, totalPages: 1, currentPage: 1 });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value,
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) {
      return;
    }

    try {
      await adminService.refundPayment(paymentId);
      alert('Payment refunded successfully');
      fetchPayments(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to refund payment');
    }
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

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'badge-success', icon: '✓' },
      pending: { class: 'badge-warning', icon: '⏳' },
      failed: { class: 'badge-error', icon: '✗' },
      processing: { class: 'badge-info', icon: '🔄' },
      refunded: { class: 'badge-default', icon: '↩' }
    };
    const config = statusConfig[status] || { class: 'badge-default', icon: '' };
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {status}
      </span>
    );
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const calculateStats = () => {
    const completed = payments.filter(p => p.payment_status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);
    const pending = payments.filter(p => p.payment_status === 'pending').length;
    const failed = payments.filter(p => p.payment_status === 'failed').length;

    return { totalRevenue, completedCount: completed.length, pending, failed };
  };

  const stats = calculateStats();

  return (
    <Layout title="All Payments">
      <div className="payments-container">
        {/* Filters Section */}
        <div className="filters-card">
          <h3>Filter Payments</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-select"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="year-filter">Year</label>
              <select
                id="year-filter"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="form-select"
              >
                <option value="">All Years</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="limit-filter">Per Page</label>
              <select
                id="limit-filter"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="form-select"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="filter-group">
              <button
                onClick={() => setFilters({
                  status: '',
                  property_id: '',
                  year: new Date().getFullYear().toString(),
                  page: 1,
                  limit: 20
                })}
                className="btn btn-secondary"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {!loading && !error && payments.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p className="stat-value">{stats.completedCount}</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p className="stat-value">{stats.pending}</p>
            </div>
            <div className="stat-card">
              <h3>Failed</h3>
              <p className="stat-value">{stats.failed}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={fetchPayments} className="btn btn-sm">
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading payments...</p>
          </div>
        )}

        {/* Payments Table */}
        {!loading && !error && (
          <>
            {payments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No payments found</h3>
                <p>No payment records match the selected filters.</p>
              </div>
            ) : (
              <>
                <div className="section-card">
                  <div className="section-header">
                    <h2>
                      💰 All Payments
                      <span className="count-badge">{pagination.total} total</span>
                    </h2>
                  </div>
                  <div className="section-content">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Tenant</th>
                            <th>Property/Unit</th>
                            <th>Period</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Method</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="payment-id">#{payment.id}</td>
                              <td>{formatDate(payment.payment_date)}</td>
                              <td>
                                {payment.user ? (
                                  <div>
                                    <div>{payment.user.first_name} {payment.user.last_name}</div>
                                    <div className="text-small text-muted">{payment.user.email}</div>
                                  </div>
                                ) : 'N/A'}
                              </td>
                              <td>
                                {payment.lease && payment.lease.unit ? (
                                  <div>
                                    <div>{payment.lease.unit.property?.name || 'N/A'}</div>
                                    <div className="text-small text-muted">Unit {payment.lease.unit.unit_number}</div>
                                  </div>
                                ) : 'N/A'}
                              </td>
                              <td>
                                {payment.payment_month && payment.payment_year
                                  ? `${getMonthName(payment.payment_month)} ${payment.payment_year}`
                                  : 'N/A'}
                              </td>
                              <td className="amount">{formatCurrency(payment.total_amount)}</td>
                              <td>{getPaymentStatusBadge(payment.payment_status)}</td>
                              <td>
                                {payment.payment_method ? (
                                  <div className="payment-method-cell">
                                    <span className="method-type">
                                      {payment.payment_method.payment_type === 'card' ? '💳' : '🏦'}
                                    </span>
                                    <div className="method-details">
                                      {payment.payment_method.payment_type === 'card'
                                        ? `**** ${payment.payment_method.card_last_four}`
                                        : `**** ${payment.payment_method.account_last_four}`}
                                    </div>
                                  </div>
                                ) : 'N/A'}
                              </td>
                              <td>
                                {payment.payment_status === 'completed' && (
                                  <button
                                    onClick={() => handleRefund(payment.id)}
                                    className="btn btn-sm btn-danger"
                                    title="Refund Payment"
                                  >
                                    Refund
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Showing {Math.min((pagination.currentPage - 1) * filters.limit + 1, pagination.total)} -{' '}
                      {Math.min(pagination.currentPage * filters.limit, pagination.total)} of {pagination.total}
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.currentPage === 1}
                        className="btn btn-sm"
                      >
                        «
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="btn btn-sm"
                      >
                        ‹ Previous
                      </button>

                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let page;
                        if (pagination.totalPages <= 5) {
                          page = i + 1;
                        } else {
                          const half = Math.floor(5 / 2);
                          if (pagination.currentPage <= half + 1) {
                            page = i + 1;
                          } else if (pagination.currentPage >= pagination.totalPages - half) {
                            page = pagination.totalPages - 5 + i + 1;
                          } else {
                            page = pagination.currentPage - half + i;
                          }
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`btn btn-sm ${page === pagination.currentPage ? 'btn-primary' : ''}`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="btn btn-sm"
                      >
                        Next ›
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="btn btn-sm"
                      >
                        »
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default AdminPayments;
