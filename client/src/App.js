import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/tenant/Dashboard';
import TenantPayments from './pages/tenant/Payments';
import TenantMakePayment from './pages/tenant/MakePayment';
import TenantMakePaymentWithWallet from './pages/tenant/MakePaymentWithWallet';
import TenantPaymentMethods from './pages/tenant/PaymentMethods';
import TenantPaymentMethodsWithWallet from './pages/tenant/PaymentMethodsWithWallet';
import TenantAutoPay from './pages/tenant/AutoPay';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/Properties';
import AdminTenants from './pages/admin/Tenants';
import AdminLeases from './pages/admin/Leases';
import AdminPayments from './pages/admin/Payments';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    // Redirect based on role
    if (user.role === 'tenant') {
      return <Navigate to="/tenant/dashboard" replace />;
    } else if (user.role === 'admin' || user.role === 'property_manager') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Tenant Routes */}
            <Route path="/tenant/dashboard" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/tenant/make-payment" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantMakePayment />
              </ProtectedRoute>
            } />
            <Route path="/tenant/make-payment-wallet" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantMakePaymentWithWallet />
              </ProtectedRoute>
            } />
            <Route path="/tenant/payments" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantPayments />
              </ProtectedRoute>
            } />
            <Route path="/tenant/payment-methods" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantPaymentMethods />
              </ProtectedRoute>
            } />
            <Route path="/tenant/payment-methods-wallet" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantPaymentMethodsWithWallet />
              </ProtectedRoute>
            } />
            <Route path="/tenant/auto-pay" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantAutoPay />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'property_manager']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/properties" element={
              <ProtectedRoute allowedRoles={['admin', 'property_manager']}>
                <AdminProperties />
              </ProtectedRoute>
            } />
            <Route path="/admin/tenants" element={
              <ProtectedRoute allowedRoles={['admin', 'property_manager']}>
                <AdminTenants />
              </ProtectedRoute>
            } />
            <Route path="/admin/leases" element={
              <ProtectedRoute allowedRoles={['admin', 'property_manager']}>
                <AdminLeases />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin', 'property_manager']}>
                <AdminPayments />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
