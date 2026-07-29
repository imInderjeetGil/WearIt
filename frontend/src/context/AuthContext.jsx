// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  logoutUser,
} from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(storedUser);

    setLoading(false);
  }, []);

  const login = (accessToken, userData = null) => {
    saveToken(accessToken);
    setToken(accessToken);

    if (userData) {
      saveUser(userData);
      setUser(userData);
    }
  };

  const logout = () => {
    logoutUser();
    setToken(null);
    setUser(null);
    
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}