import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe } from '../api/auth';
import { ROUTES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('access_token');
    return saved && saved !== 'undefined' && saved !== 'null' ? saved : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('access_token');
      if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
        try {
          const res = await getMe();
          const userData = res?.data || res;
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    // FastAPI returns { success: true, message: "...", data: { access_token: "...", token_type: "bearer" } }
    const accessToken = res?.data?.access_token || res?.access_token;
    if (!accessToken) {
      throw new Error(res?.message || 'Login failed: No access token received');
    }
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    const userRes = await getMe();
    const userData = userRes?.data || userRes;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    window.location.href = ROUTES.LOGIN;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
