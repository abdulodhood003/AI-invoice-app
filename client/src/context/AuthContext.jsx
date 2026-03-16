import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the Context
const AuthContext = createContext();

/**
 * Custom hook for components to easily consume the AuthContext
 * @returns {Object} { user, login, register, logout, loading, error }
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Provider component that wraps the application and passes down the auth state.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Global auth loading state
  const [error, setError] = useState(null);

  // Check if a user session exists in localStorage on initial mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to parse user info from local storage:', err);
        localStorage.removeItem('userInfo'); // Clear corrupted data
      } finally {
        setLoading(false); // Done checking persistent state
      }
    };

    checkLoggedIn();
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  const register = async (userData) => {
    setError(null);
    try {
      // API call to the backend route we created earlier
      const response = await api.post('/auth/register', userData);
      
      const loggedInUser = response.data;
      
      // Persist to local storage
      localStorage.setItem('userInfo', JSON.stringify(loggedInUser));
      
      // Update React state
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Log in an existing user
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      
      const loggedInUser = response.data;
      
      localStorage.setItem('userInfo', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Log out the current user
   */
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // The value object given to all consumers of the context
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
