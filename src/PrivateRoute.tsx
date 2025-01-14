import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

interface PrivateRouteProps {
  children: JSX.Element;
  role?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user } = useAuth();
  console.log('PrivateRoute: Checking access', {
    user,
    requiredRole: role,
    hasAccess: user?.role === role
  });

  if (!user) {
    console.log('PrivateRoute: No user found, redirecting to login');
    const redirectUrl = role === 'admin' ? '/login?admin=true' : '/login';
    return <Navigate to={redirectUrl} />;
  }

  if (role && user.role !== role) {
    console.log('PrivateRoute: User lacks required role, redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('PrivateRoute: Access granted');
  return children;
};

export default PrivateRoute; 