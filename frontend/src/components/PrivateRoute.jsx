import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 