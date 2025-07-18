import axios from 'axios';
import Cookies from 'js-cookie';

// Set base URL from environment variable
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

// Add a request interceptor to include JWT token in all requests
axios.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = Cookies.get('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ No token found for request:', config.url);
    }
    
    console.log('📤 Request headers:', config.headers);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response successful:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.config?.url, 'Status:', error.response?.status, 'Message:', error.message);
    
    // If unauthorized (401) and not on login page, redirect to login
    if (error.response && error.response.status === 401 && window.location.pathname !== '/login') {
      console.warn('🚨 401 Unauthorized detected, redirecting to login');
      
      // Remove token
      Cookies.remove('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axios;