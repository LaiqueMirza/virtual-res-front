import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component
 * Redirects to login page if user is not authenticated
 * Otherwise, renders the protected component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated, passing the current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;