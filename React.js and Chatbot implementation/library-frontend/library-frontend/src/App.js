import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LibrarianDashboard from './pages/librarian/LibrarianDashboard';
import UserDashboard from './pages/user/UserDashboard';

const RoleRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'LIBRARIAN') return <Navigate to="/librarian" replace />;
  return <Navigate to="/user" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RoleRoute />} />
          <Route path="/librarian/*" element={<LibrarianDashboard />} />
          <Route path="/user/*" element={<UserDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;