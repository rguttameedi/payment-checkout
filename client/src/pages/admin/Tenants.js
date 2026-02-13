import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/Admin.css';

function AdminTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20
  });

  useEffect(() => {
    fetchTenants();
  }, [search, statusFilter, pagination.currentPage]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTenants({
        search,
        status: statusFilter,
        page: pagination.currentPage,
        limit: pagination.limit
      });
      setTenants(response.data.data?.tenants || []);
      setPagination(response.data.data?.pagination || { total: 0, totalPages: 1, currentPage: 1, limit: 20 });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
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

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <Layout title="Tenants">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>👥 Tenants</h1>
            <p className="page-subtitle">Manage tenant accounts and information</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination({ ...pagination, currentPage: 1 });
              }}
              className="search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="form-select"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
            <p>Loading tenants...</p>
          </div>
        )}

        {/* Tenants Table */}
        {!loading && (
          <>
            {tenants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No tenants found</h3>
                <p>
                  {search || statusFilter
                    ? 'Try adjusting your search or filter criteria'
                    : 'Tenants will appear here once they register'}
                </p>
              </div>
            ) : (
              <>
                <div className="section-card">
                  <div className="section-header">
                    <h2>
                      Tenant List
                      <span className="count-badge">{pagination.total} total</span>
                    </h2>
                  </div>
                  <div className="section-content">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Active Lease</th>
                            <th>Property/Unit</th>
                            <th>Move-in Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenants.map((tenant) => {
                            const activeLease = tenant.leases?.find(l => l.status === 'active');
                            return (
                              <tr key={tenant.id}>
                                <td>
                                  <div className="tenant-name-cell">
                                    <strong>
                                      {tenant.first_name} {tenant.last_name}
                                    </strong>
                                  </div>
                                </td>
                                <td>{tenant.email}</td>
                                <td>{formatPhone(tenant.phone_number)}</td>
                                <td>
                                  {activeLease ? (
                                    <span className="badge badge-success">Yes</span>
                                  ) : (
                                    <span className="badge badge-default">No</span>
                                  )}
                                </td>
                                <td>
                                  {activeLease?.unit ? (
                                    <div>
                                      <div>{activeLease.unit.property?.name || 'N/A'}</div>
                                      <div className="unit-number">
                                        Unit {activeLease.unit.unit_number}
                                      </div>
                                    </div>
                                  ) : (
                                    'N/A'
                                  )}
                                </td>
                                <td>
                                  {activeLease
                                    ? formatDate(activeLease.lease_start_date)
                                    : 'N/A'}
                                </td>
                                <td>
                                  <span className={`badge ${activeLease ? 'badge-success' : 'badge-default'}`}>
                                    {activeLease ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Showing {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.total)} -{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total}
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={() => setPagination({ ...pagination, currentPage: 1 })}
                        disabled={pagination.currentPage === 1}
                        className="btn btn-sm"
                      >
                        «
                      </button>
                      <button
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                        disabled={pagination.currentPage === 1}
                        className="btn btn-sm"
                      >
                        ‹
                      </button>
                      <span className="pagination-current">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="btn btn-sm"
                      >
                        ›
                      </button>
                      <button
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.totalPages })}
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

export default AdminTenants;
