import React, { useState, useEffect } from 'react';
import { tenantService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import { generatePaymentReceipt } from '../../utils/pdfGenerator';
import '../../assets/css/Payments.css';

function TenantPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    year: new Date().getFullYear().toString(),
    page: 1,
    limit: 10
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
      const response = await tenantService.getPaymentHistory(filters);
      setPayments(response.data.data?.payments || []);
      setPagination(response.data.data?.pagination || { total: 0, totalPages: 1, currentPage: 1 });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
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

  const handleDownloadReceipt = (payment) => {
    try {
      generatePaymentReceipt(payment);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  return (
    <Layout title="Payment History">
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
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="filter-group">
              <button
                onClick={() => setFilters({
                  status: '',
                  year: new Date().getFullYear().toString(),
                  page: 1,
                  limit: 10
                })}
                className="btn btn-secondary"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

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
                <p>You don't have any payment history matching the selected filters.</p>
              </div>
            ) : (
              <>
                <div className="section-card">
                  <div className="section-header">
                    <h2>
                      💰 Payment History
                      <span className="count-badge">{pagination.total} total</span>
                    </h2>
                  </div>
                  <div className="section-content">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Payment ID</th>
                            <th>Date</th>
                            <th>Period</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Payment Method</th>
                            <th>Transaction ID</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="payment-id">#{payment.id}</td>
                              <td>{formatDate(payment.payment_date)}</td>
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
                                    <div>
                                      <div className="method-nickname">
                                        {payment.payment_method.nickname || 'Payment Method'}
                                      </div>
                                      <div className="method-details">
                                        {payment.payment_method.payment_type === 'card'
                                          ? `**** ${payment.payment_method.card_last_four}`
                                          : `**** ${payment.payment_method.account_last_four}`}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  'N/A'
                                )}
                              </td>
                              <td className="transaction-id">
                                {payment.transaction_id || 'N/A'}
                              </td>
                              <td className="actions-cell">
                                <button
                                  onClick={() => handleDownloadReceipt(payment)}
                                  className="btn btn-sm btn-primary"
                                  title="Download Receipt"
                                >
                                  📄 Receipt
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Payment Details Expandable Rows (Future Enhancement) */}
                    {/* Could add expandable rows here to show more details */}
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

                      {/* Page Numbers */}
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && <span className="pagination-ellipsis">...</span>}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`btn btn-sm ${page === pagination.currentPage ? 'btn-primary' : ''}`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
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

        {/* Summary Statistics */}
        {!loading && !error && payments.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Paid (This Year)</h3>
              <p className="stat-value">
                {formatCurrency(
                  payments
                    .filter(p => p.payment_status === 'completed')
                    .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0)
                )}
              </p>
            </div>
            <div className="stat-card">
              <h3>Payments Made</h3>
              <p className="stat-value">
                {payments.filter(p => p.payment_status === 'completed').length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p className="stat-value">
                {payments.filter(p => p.payment_status === 'pending').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TenantPayments;
