import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Customer Pages
import JoinQueue from './pages/customer/JoinQueue';
import QueueStatusPage from './pages/customer/QueueStatusPage';
import QueueHistory from './pages/customer/QueueHistory';

// Business Pages
import Dashboard from './pages/business/Dashboard';
import QueueManagement from './pages/business/QueueManagement';
import CreateQueue from './pages/business/CreateQueue';
import StaffManagement from './pages/business/StaffManagement';
import Analytics from './pages/business/Analytics';
import QRCodePage from './pages/business/QRCodePage';
import Settings from './pages/business/Settings';

// Common
import Spinner from './components/common/Spinner';

/**
 * Role-based Protected Route Guard
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole =
      allowedRoles.includes(user.role) || user.role === 'PLATFORM_ADMIN';
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Pages */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Landing />
                </PublicLayout>
              }
            />
            <Route
              path="/login"
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PublicLayout>
                  <Register />
                </PublicLayout>
              }
            />

            {/* Customer Queue Endpoints (No authentication required to join/view) */}
            <Route path="/queue/:queueId/join" element={<JoinQueue />} />
            <Route path="/queue/:queueId/status/:entryId" element={<QueueStatusPage />} />

            {/* Customer History (Protected) */}
            <Route
              path="/queue-history"
              element={
                <PublicLayout>
                  <QueueHistory />
                </PublicLayout>
              }
            />

            {/* Business Dashboard Routes (Protected for Business Admin & Staff) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/queues/new"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'PLATFORM_ADMIN']}>
                  <CreateQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/queues/:queueId"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN']}>
                  <QueueManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/queues/:queueId/qr"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN']}>
                  <QRCodePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/staff"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'PLATFORM_ADMIN']}>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_ADMIN', 'PLATFORM_ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Staff shortcut */}
            <Route
              path="/staff/dashboard"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

