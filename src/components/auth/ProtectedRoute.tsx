import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAppSelector } from "@/redux/hook";
import { useGetCurrentUserQuery } from "@/redux/features/auth/authApi";
import { 
  selectIsAuthenticated, 
  selectUser, 
  selectAuthLoading, 
  selectAuthTokens
} from "@/redux/store";
import type { UserRole, AccountStatus, RoutePermission, ProtectedRouteProps } from "@/types/auth";

// Enhanced ProtectedRoute with JWT and account status handling
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission,
  fallbackPath = "/auth/login",
  showStatusPage = true
}) => {
  const location = useLocation();
  
  // Redux state
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser) as { accountStatus?: string; role?: string; isEmailVerified?: boolean; isPhoneVerified?: boolean; } | null;
  const isLoading = useAppSelector(selectAuthLoading);
  const tokens = useAppSelector(selectAuthTokens) as { accessToken?: string; refreshToken?: string; expiresIn?: number; } | null;
  const accountStatus = user?.accountStatus;

  // Get current user data
  const { 
    isLoading: isUserLoading, 
    error: userError 
  } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated || !tokens?.accessToken,
  });

  // Check if we have valid authentication
  const hasValidTokens = tokens && tokens.accessToken && tokens.refreshToken;
  const isTokenExpired = tokens?.expiresIn ? Date.now() > (tokens.expiresIn * 1000) : false;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 ProtectedRoute Debug:', {
        isAuthenticated,
        hasUser: !!user,
        hasValidTokens: !!hasValidTokens,
        isTokenExpired,
        userRole: user?.role,
        accountStatus,
        requiredRoles: permission.roles,
        requiredStatuses: permission.statuses,
        pathname: location.pathname,
        isLoading: isLoading || isUserLoading,
      });
    }
  }, [
    isAuthenticated, user, hasValidTokens, isTokenExpired, 
    accountStatus, permission, location.pathname, isLoading, isUserLoading
  ]);

  // Show loading while checking authentication
  if (isLoading || isUserLoading || (!user && hasValidTokens && !userError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Authenticating...</p>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Restoring session...' : 'Validating credentials...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle token expiration
  if (isTokenExpired) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ 
          from: location, 
          message: 'Your session has expired. Please login again.' 
        }} 
        replace 
      />
    );
  }

  // Handle authentication failure
  if (!isAuthenticated || !hasValidTokens || !user || userError) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          from: location,
          message: userError ? 'Authentication failed. Please login again.' : undefined
        }} 
        replace 
      />
    );
  }

  // Check role permissions
  const userRole = user.role as UserRole;
  if (!permission.roles.includes(userRole)) {
    // Redirect to appropriate dashboard if user has wrong role
    const dashboardPaths = {
      rider: '/rider/dashboard',
      driver: '/driver/dashboard',
      admin: '/admin/dashboard',
    };
    
    return (
      <Navigate 
        to={dashboardPaths[userRole] || '/unauthorized'} 
        state={{ 
          message: `Access denied. This page is not available for ${userRole}s.` 
        }} 
        replace 
      />
    );
  }

  // Check account status permissions
  const currentAccountStatus = user.accountStatus as AccountStatus;
  if (!permission.statuses.includes(currentAccountStatus)) {
    if (!showStatusPage) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            message: `Your account status (${currentAccountStatus}) does not allow access to this page.` 
          }} 
          replace 
        />
      );
    }

    // Redirect to appropriate status page
    const statusPaths = {
      blocked: '/auth/account-blocked',
      suspended: '/auth/account-suspended',
      pending_verification: '/auth/verify-account',
      offline_restricted: '/driver/offline-restricted',
    };

    const statusPath = statusPaths[currentAccountStatus as keyof typeof statusPaths];
    if (statusPath) {
      return (
        <Navigate 
          to={statusPath} 
          state={{ user }} 
          replace 
        />
      );
    }
  }

  // Check verification requirements
  if (permission.requiresVerification) {
    if (permission.requiresVerification.email && !user.isEmailVerified) {
      return (
        <Navigate 
          to="/auth/verify-email" 
          state={{ 
            user,
            message: 'Please verify your email address to continue.' 
          }} 
          replace 
        />
      );
    }

    if (permission.requiresVerification.phone && !user.isPhoneVerified) {
      return (
        <Navigate 
          to="/auth/verify-phone" 
          state={{ 
            user,
            message: 'Please verify your phone number to continue.' 
          }} 
          replace 
        />
      );
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

// Convenience wrapper for simple role-based protection
interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  allowedStatuses?: AccountStatus[];
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
}

export const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({
  children,
  requiredRole = ['rider', 'driver', 'admin'],
  allowedStatuses = ['active'],
  requireEmailVerification = false,
  requirePhoneVerification = false,
}) => {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  const permission: RoutePermission = {
    roles,
    statuses: allowedStatuses,
    requiresVerification: {
      email: requireEmailVerification,
      phone: requirePhoneVerification,
    },
  };

  return (
    <ProtectedRoute permission={permission}>
      {children}
    </ProtectedRoute>
  );
};