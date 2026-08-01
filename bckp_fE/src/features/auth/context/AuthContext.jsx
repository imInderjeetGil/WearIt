// src/context/AuthContext.jsx

import { useState } from "react";
import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  logoutUser,
} from "../api/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser);
  const [token, setToken] = useState(getToken);

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
        loading: false,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
