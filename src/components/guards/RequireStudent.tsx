import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSession, subscribeAuth } from '../../services/auth';
import { AuthSession } from '../../types';

export const RequireStudent: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => getSession());
  const location = useLocation();

  useEffect(() => {
    // Keep auth state synchronized across tabs and operations
    const unsubscribe = subscribeAuth((newSession) => {
      setSession(newSession);
    });
    return unsubscribe;
  }, []);

  if (!session) {
    // Preserve requested target URL so login page can redirect after authentication
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  // Forced password change: user cannot access any other portal page until completed
  if (session.must_change_password && location.pathname !== '/portal/change-password') {
    return <Navigate to="/portal/change-password" replace />;
  }

  return <Outlet />;
};
