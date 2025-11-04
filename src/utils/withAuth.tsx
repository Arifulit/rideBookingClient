/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser, selectAuthTokens, selectAuthLoading } from "@/redux/store";

// Enhanced withAuth HOC with bulletproof authentication
export const withAuth = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) => {
  return (props: P) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser) as { role?: string; id?: string; email?: string; } | null;
    const tokens = useSelector(selectAuthTokens) as { accessToken?: string; } | null;
    const loading = useSelector(selectAuthLoading);
    const token = (tokens as { accessToken?: string } | null)?.accessToken;
    const location = useLocation();
    const [authAttempts, setAuthAttempts] = React.useState(0);

    // Enhanced debugging with timestamp
    console.log(`🔐 [${new Date().toLocaleTimeString()}] withAuth Debug:`, {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      hasTokens: !!tokens,
      isLoading: loading,
      userRole: (user as { role?: string } | null)?.role,
      requiredRole,
      pathname: location.pathname,
      authAttempts
    });

    // Extended loading period for better auth stability
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 300); // Give more time for auth to stabilize
      return () => clearTimeout(timer);
    }, []);

    // Show loading spinner while Redux persist restores state
    if (loading || !isReady) {
      console.log("withAuth: Showing loading screen");
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading application...</p>
          </div>
        </div>
      );
    }

    // Multiple authentication validation layers
    const hasValidToken = (tokens?.accessToken || token) &&
      typeof (tokens?.accessToken || token) === 'string' &&
      ((tokens?.accessToken || token) as string).length > 10;
    const hasValidUser = user && typeof user === 'object' && (user.id || user.email);
    const authStateValid = isAuthenticated === true;

    // Try localStorage recovery if auth state is incomplete
    if (!hasValidToken || !hasValidUser) {
      if (authAttempts < 3) { // Limit retry attempts
        const backupToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const backupUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (backupToken && backupUser && authAttempts < 2) {
          console.log("🔄 withAuth: Attempting auth recovery", { authAttempts });
          setAuthAttempts(prev => prev + 1);

          // Give time for potential auth recovery
          return (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Restoring session... ({authAttempts + 1}/3)</p>
              </div>
            </div>
          );
        }
      }
    }

    const isReallyAuthenticated = authStateValid && hasValidUser && hasValidToken;

    // Final authentication check before redirect
    if (!isReallyAuthenticated && authAttempts >= 2) {
      console.log("❌ withAuth: Authentication failed after retries", {
        authStateValid,
        hasValidUser,
        hasValidToken,
        authAttempts
      });
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based access control with flexible user/rider mapping
    if (requiredRole && isReallyAuthenticated) {
      const userRole = user?.role?.toLowerCase();
      const normalizedRequiredRole = requiredRole.toLowerCase();

      // Allow both 'user' and 'rider' roles for rider routes
      const roleMatches = userRole === normalizedRequiredRole ||
        (normalizedRequiredRole === 'rider' && userRole === 'user') ||
        (normalizedRequiredRole === 'user' && userRole === 'rider');

      if (!roleMatches) {
        console.log("🚫 withAuth: Role mismatch", {
          userRole: user?.role,
          requiredRole,
          normalizedUserRole: userRole,
          normalizedRequiredRole
        });
        return <Navigate to="/unauthorized" replace />;
      }
    }

    console.log("✅ withAuth: Access granted, rendering component");
    return <Component {...props} />;
  };
};