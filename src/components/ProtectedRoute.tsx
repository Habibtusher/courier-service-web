import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-300">Verifying security token...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl max-w-md text-center space-y-3">
          <h3 className="text-xl font-bold">Access Denied</h3>
          <p className="text-sm">
            Your current role (<span className="font-mono font-semibold">{user.role}</span>) does not have authorization to view this page.
          </p>
          <a href="/" className="inline-block text-xs font-bold text-red-800 underline mt-2">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
