import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '../services/api';

const AuthContext = createContext(null);

// Session timeout duration (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const sessionTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
  }, []);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    console.log('Session timeout - logging out');
    clearTimeouts();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  }, [clearTimeouts]);

  // Reset session timeout on user activity
  const resetSessionTimeout = useCallback(() => {
    clearTimeouts();
    
    // Set new timeout
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, SESSION_TIMEOUT);
  }, [clearTimeouts, handleSessionTimeout]);

  // Track user activity
  useEffect(() => {
    if (isAuthenticated) {
      const handleActivity = () => {
        resetSessionTimeout();
      };

      // Listen for user activity
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('touchstart', handleActivity);

      // Start initial timeout
      resetSessionTimeout();

      return () => {
        window.removeEventListener('mousedown', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('scroll', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
        clearTimeouts();
      };
    }
  }, [isAuthenticated, resetSessionTimeout, clearTimeouts]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await adminAPI.verifyToken();
        setUser(response.data.admin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        // Try to refresh token
        try {
          await adminAPI.refreshToken();
          const retryResponse = await adminAPI.verifyToken();
          setUser(retryResponse.data.admin);
          setIsAuthenticated(true);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const { admin } = await adminAPI.login(credentials);
      setUser(admin);
      setIsAuthenticated(true);
      resetSessionTimeout();
      return { success: true, admin };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  }, [resetSessionTimeout]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTimeouts();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [clearTimeouts]);

  // Logout from all devices
  const logoutAll = useCallback(async () => {
    try {
      await adminAPI.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      clearTimeouts();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [clearTimeouts]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    logoutAll,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for login
export const useLogin = () => {
  const { login } = useAuth();
  return login;
};

// Custom hook for logout
export const useLogout = () => {
  const { logout, logoutAll } = useAuth();
  return { logout, logoutAll };
};

export default AuthContext;
