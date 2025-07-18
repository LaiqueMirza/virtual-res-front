import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from '../utils/axiosConfig'; // Import configured axios instance

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/login`,
        { email, password }
      );

      if (response.data.success) {
        const { token } = response.data;
        
        // Store token in cookie (expires in 1 day)
        Cookies.set('token', token, { expires: 1 });
        
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from cookies
    Cookies.remove('token');
    
    setIsAuthenticated(false);
  };

  // Value object that will be passed to any consumer components
  const value = {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};