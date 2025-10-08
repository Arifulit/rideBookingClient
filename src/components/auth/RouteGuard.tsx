import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectUser, selectAuthTokens, selectAuthLoading } from '@/redux/store';
import { setCredentials } from '@/redux/index';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiredRole }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser) as { role?: string } | null;
  const tokens = useSelector(selectAuthTokens) as { accessToken?: string } | null;
  const loading = useSelector(selectAuthLoading);
  const token = tokens?.accessToken;
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      // If already authenticated, mark as checked
      if (isAuthenticated && user && token) {
        setAuthChecked(true);
        return;
      }

      // Try to recover from localStorage/sessionStorage
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const storedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔄 RouteGuard: Recovering authentication from storage');
          
          dispatch(setCredentials({
            user: parsedUser,
            token: storedToken,
            refreshToken: storedRefreshToken
          }));
        } catch (error) {
          console.error('❌ RouteGuard: Failed to parse stored user data', error);
          // Clear corrupted data
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
        }
      }
      
      // dispatch(rehydrateAuth()); // Commented out - function not available
      setAuthChecked(true);
    };

    // Small delay to allow Redux persist to complete
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [dispatch, isAuthenticated, user, token]);

  // Show loading while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const isReallyAuthenticated = isAuthenticated && user && token && (user as { id?: string })?.id;
  
  if (!isReallyAuthenticated) {
    console.log('🚫 RouteGuard: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const userRole = user?.role?.toLowerCase();
    const normalizedRequiredRole = requiredRole.toLowerCase();
    
    // Flexible role matching (user ↔ rider)
    const roleMatches = userRole === normalizedRequiredRole || 
                       (normalizedRequiredRole === 'rider' && userRole === 'user') ||
                       (normalizedRequiredRole === 'user' && userRole === 'rider');
    
    if (!roleMatches) {
      console.log('🚫 RouteGuard: Role mismatch', { 
        userRole: user?.role, 
        requiredRole,
        pathname: location.pathname
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('✅ RouteGuard: Access granted', {
    userRole: user?.role,
    requiredRole,
    pathname: location.pathname
  });

  return <>{children}</>;
};

export default RouteGuard;