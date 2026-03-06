import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mediwatch_user');
      const savedType = localStorage.getItem('mediwatch_type');
      if (saved && saved !== 'undefined') {
        setUser(JSON.parse(saved));
        setUserType(savedType);
      }
    } catch (e) {
      localStorage.removeItem('mediwatch_user');
      localStorage.removeItem('mediwatch_type');
    }
  }, []);

  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('mediwatch_user', JSON.stringify(userData));
    localStorage.setItem('mediwatch_type', type);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('mediwatch_user');
    localStorage.removeItem('mediwatch_type');
  };

  return (
    <AuthContext.Provider value={{ user, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);