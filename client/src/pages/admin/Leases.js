import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/Admin.css';

function AdminLeases() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    property_id: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });

  useEffect(() => {
    fetchLeases();
  }, [filters]);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const response = await adminService.getLeases(filters);
      setLeases(response.data.data?.leases || []);
      setPagination(response.data.data?.pagination || { total: 0, totalPages: 1, currentPage: 1 });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leases');
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

  const handleTerminate = async (id, tenantName) => {
    if (!window.confirm(`Are you sure you want to terminate the lease for ${tenantName}? This will mark the unit as vacant.`)) {
      return;
    }

    try {
      await adminService.terminateLease(id);
      fetchLeases();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to terminate lease');
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
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'badge-success', text: 'Active' },
      expired: { class: 'badge-warning', text: 'Expired' },
      terminated: { class: 'badge-error', text: 'Terminated' }
    };
    const config = statusConfig[status] || { class: 'badge-default', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <Layout title="Leases">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>📝 Leases</h1>
            <p className="page-subtitle">Manage tenant lease agreements</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
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
            <p>Loading leases...</p>
          </div>
        )}

        {/* Leases Table */}
        {!loading && (
          <>
            {leases.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No leases found</h3>
                <p>
                  {filters.status
                    ? 'Try adjusting your filter criteria'
                    : 'Leases will appear here once created'}
                </p>
              </div>
            ) : (
              <>
                <div className="section-card">
                  <div className="section-header">
                    <h2>
                      Lease Agreements
                      <span className="count-badge">{pagination.total} total</span>
                    </h2>
                  </div>
                  <div className="section-content">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Tenant</th>
                            <th>Property</th>
                            <th>Unit</th>
                            <th>Monthly Rent</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leases.map((lease) => (
                            <tr key={lease.id}>
                              <td>
                                {lease.tenant ? (
                                  <div>
                                    <div className="tenant-name">
                                      {lease.tenant.first_name} {lease.tenant.last_name}
                                    </div>
                                    <div className="tenant-email">
                                      {lease.tenant.email}
                                    </div>
                                  </div>
                                ) : (
                                  'N/A'
                                )}
                              </td>
                              <td>
                                {lease.unit?.property?.name || 'N/A'}
                              </td>
                              <td>
                                <span className="unit-badge">
                                  {lease.unit?.unit_number || 'N/A'}
                                </span>
                              </td>
                              <td className="amount">
                                {formatCurrency(lease.monthly_rent)}
                              </td>
                              <td>{formatDate(lease.lease_start_date)}</td>
                              <td>{formatDate(lease.lease_end_date)}</td>
                              <td>{getStatusBadge(lease.status)}</td>
                              <td>
                                {lease.status === 'active' && (
                                  <button
                                    onClick={() => handleTerminate(
                                      lease.id,
                                      `${lease.tenant?.first_name} ${lease.tenant?.last_name}`
                                    )}
                                    className="btn btn-sm btn-danger"
                                  >
                                    Terminate
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

                {/* Summary Stats */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Active Leases</h3>
                    <p className="stat-value">
                      {leases.filter(l => l.status === 'active').length}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Monthly Revenue</h3>
                    <p className="stat-value">
                      {formatCurrency(
                        leases
                          .filter(l => l.status === 'active')
                          .reduce((sum, l) => sum + parseFloat(l.monthly_rent || 0), 0)
                      )}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>Expiring Soon</h3>
                    <p className="stat-value">
                      {leases.filter(l => {
                        const endDate = new Date(l.lease_end_date);
                        const today = new Date();
                        const daysUntilEnd = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
                        return daysUntilEnd > 0 && daysUntilEnd <= 60 && l.status === 'active';
                      }).length}
                    </p>
                    <p className="stat-label">Within 60 days</p>
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={() => handleFilterChange('page', 1)}
                        disabled={pagination.currentPage === 1}
                        className="btn btn-sm"
                      >
                        «
                      </button>
                      <button
                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="btn btn-sm"
                      >
                        ‹
                      </button>
                      <span className="pagination-current">
                        {pagination.currentPage}
                      </span>
                      <button
                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="btn btn-sm"
                      >
                        ›
                      </button>
                      <button
                        onClick={() => handleFilterChange('page', pagination.totalPages)}
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

export default AdminLeases;
