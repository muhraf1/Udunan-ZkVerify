import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/ui/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { token, isLoggedIn } = useAuth();
    const location = useLocation();
  
    // While loading, don't redirect
    if (token === null) {
      return <div>Loading...</div>;
    }
  
    if (!isLoggedIn || !token) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  
    return children;
  };
  
  export default ProtectedRoute;