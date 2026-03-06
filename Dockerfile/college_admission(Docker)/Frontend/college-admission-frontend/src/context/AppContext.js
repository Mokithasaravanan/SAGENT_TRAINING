import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const login = (user, role) => {
    setCurrentUser(user);
    setUserRole(role);
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, userRole, login, logout, notification, showNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);