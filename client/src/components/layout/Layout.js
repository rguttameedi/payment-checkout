import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/css/Layout.css';

function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getTenantNav = () => (
    <nav className="sidebar">
      <div className="nav-header">
        <h2>Tenant Portal</h2>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/tenant/dashboard">
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/tenant/payments">
            <span className="icon">💰</span>
            <span>Payment History</span>
          </Link>
        </li>
        <li>
          <Link to="/tenant/payment-methods">
            <span className="icon">💳</span>
            <span>Payment Methods</span>
          </Link>
        </li>
        <li>
          <Link to="/tenant/auto-pay">
            <span className="icon">🔄</span>
            <span>Auto-Pay</span>
          </Link>
        </li>
      </ul>
    </nav>
  );

  const getAdminNav = () => (
    <nav className="sidebar">
      <div className="nav-header">
        <h2>Admin Portal</h2>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/admin/dashboard">
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/properties">
            <span className="icon">🏢</span>
            <span>Properties</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/tenants">
            <span className="icon">👥</span>
            <span>Tenants</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/leases">
            <span className="icon">📝</span>
            <span>Leases</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/payments">
            <span className="icon">💵</span>
            <span>Payments</span>
          </Link>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      {user?.role === 'tenant' ? getTenantNav() : getAdminNav()}

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1>{title}</h1>
          </div>
          <div className="header-right">
            <div className="user-menu">
              <span className="user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="user-role">
                ({user?.role})
              </span>
              <button onClick={handleLogout} className="btn btn-sm">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
