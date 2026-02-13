import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import Layout from '../../components/layout/Layout';
import '../../assets/css/Admin.css';

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  useEffect(() => {
    fetchProperties();
  }, [search, pagination.currentPage]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProperties({
        search,
        page: pagination.currentPage,
        limit: pagination.limit
      });
      setProperties(response.data.properties);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteProperty(id);
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete property');
    }
  };

  return (
    <Layout title="Properties">
      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>🏢 Properties</h1>
            <p className="page-subtitle">Manage your rental properties</p>
          </div>
          <Link to="/admin/properties/create" className="btn btn-primary">
            <span className="btn-icon">+</span>
            Add Property
          </Link>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search properties by name, address, or city..."
              value={search}
              onChange={handleSearch}
              className="search-input"
            />
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
            <p>Loading properties...</p>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && (
          <>
            {properties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3>No properties found</h3>
                <p>
                  {search
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first property'}
                </p>
                {!search && (
                  <Link to="/admin/properties/create" className="btn btn-primary">
                    Add Your First Property
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="properties-grid">
                  {properties.map((property) => (
                    <div key={property.id} className="property-card">
                      <div className="property-header">
                        <h3>{property.name}</h3>
                        <span className={`property-type ${property.property_type}`}>
                          {property.property_type || 'N/A'}
                        </span>
                      </div>

                      <div className="property-details">
                        <div className="detail-row">
                          <span className="detail-icon">📍</span>
                          <span className="detail-text">
                            {property.address_line1}<br />
                            {property.city}, {property.state} {property.zip_code}
                          </span>
                        </div>

                        <div className="property-stats">
                          <div className="stat-item">
                            <span className="stat-number">{property.total_units || 0}</span>
                            <span className="stat-label">Total Units</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">
                              {property.units?.filter(u => u.status === 'occupied').length || 0}
                            </span>
                            <span className="stat-label">Occupied</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">
                              {property.units?.filter(u => u.status === 'vacant').length || 0}
                            </span>
                            <span className="stat-label">Vacant</span>
                          </div>
                        </div>

                        {property.description && (
                          <div className="property-description">
                            {property.description}
                          </div>
                        )}
                      </div>

                      <div className="property-actions">
                        <Link
                          to={`/admin/properties/${property.id}`}
                          className="btn btn-sm btn-secondary"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/admin/properties/${property.id}/units`}
                          className="btn btn-sm btn-secondary"
                        >
                          Manage Units
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id, property.name)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
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
                        ‹ Previous
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                          );
                        })
                        .map((page, index, array) => {
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && <span className="pagination-ellipsis">...</span>}
                              <button
                                onClick={() => setPagination({ ...pagination, currentPage: page })}
                                className={`btn btn-sm ${page === pagination.currentPage ? 'btn-primary' : ''}`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="btn btn-sm"
                      >
                        Next ›
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

export default AdminProperties;
