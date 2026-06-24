import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Loader from './components/ui/Loader.jsx';

// Layouts
import Layout from './components/layout/Layout.jsx';

// Pages


const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Clients = lazy(() => import('./pages/Clients.jsx'));
const Invoices = lazy(() => import('./pages/Invoices.jsx'));
const CreateInvoice = lazy(() => import('./pages/CreateInvoice.jsx'));
const InvoiceDetails = lazy(() => import('./pages/InvoiceDetails.jsx'));
const EditInvoice = lazy(() => import('./pages/EditInvoice.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

// Route Guard to prevent logged-in users from seeing Login/Register
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader fullScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes Wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="clients" element={<Clients />} />

          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<CreateInvoice />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/:id/edit" element={<EditInvoice />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
