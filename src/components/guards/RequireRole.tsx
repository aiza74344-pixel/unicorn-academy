import React, { lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { getSession } from '../../services/auth';
import AccessDenied from '../../pages/portal/AccessDenied';

const ComingSoon = lazy(() => import('../../pages/public/ComingSoon'));

interface RequireRoleProps {
  allowedRole: 'student' | 'admin';
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRole }) => {
  const session = getSession();

  if (session && session.role !== allowedRole) {
    // Logged in student trying to access admin routes must see Access Denied
    return <AccessDenied />;
  }

  if (!session) {
    // Unauthenticated visitors trying to open admin routes see ComingSoon
    return <ComingSoon />;
  }

  return <Outlet />;
};
