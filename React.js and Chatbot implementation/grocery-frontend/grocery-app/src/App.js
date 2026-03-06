import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Chatbot from './components/Chatbot';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerCart from './pages/customer/CustomerCart';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDelivery from './pages/admin/AdminDelivery';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminPayments from './pages/admin/AdminPayments';

// Delivery
import DeliveryLayout from './pages/delivery/DeliveryLayout';
import DeliveryHome from './pages/delivery/DeliveryHome';
import DeliveryProfile from './pages/delivery/DeliveryProfile';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

// ✅ Chatbot is here — inside AuthProvider so it can access user
function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={`/${user.role}`} replace />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={`/${user.role}`} replace />} />

        {/* Customer */}
        <Route path="/customer" element={<PrivateRoute role="customer"><CustomerLayout /></PrivateRoute>}>
          <Route index element={<CustomerHome />} />
          <Route path="cart" element={<CustomerCart />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="notifications" element={<CustomerNotifications />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* Delivery */}
        <Route path="/delivery" element={<PrivateRoute role="delivery"><DeliveryLayout /></PrivateRoute>}>
          <Route index element={<DeliveryHome />} />
          <Route path="profile" element={<DeliveryProfile />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* ✅ Chatbot — only show when user is logged in */}
      {user && <Chatbot user={user} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}