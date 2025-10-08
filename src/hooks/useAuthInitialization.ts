import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useGetCurrentUserQuery } from '@/redux/features/auth/authApi';
import { User } from '@/types';
import { 
  setCredentials as loginSuccess,
  logout as clearAuthState,
  setCredentials as restoreAuthState
} from '@/redux/index';
import { selectIsAuthenticated, selectAuthTokens } from '@/redux/store';

/**
 * Hook to initialize authentication state on app startup
 * This hook:
 * 1. Restores auth state from localStorage/sessionStorage
 * 2. Validates stored tokens by fetching current user
 * 3. Clears invalid auth state if tokens are expired/invalid
 */
export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const tokens = useAppSelector(selectAuthTokens) as { accessToken?: string; refreshToken?: string; expiresIn?: number; tokenType?: string; } | null;

  // Query to validate current user (only runs if we have tokens)
  const {
    data: currentUser,
    isLoading: isValidatingUser,
    error: userError,
    refetch: validateUser,
  } = useGetCurrentUserQuery(undefined, {
    skip: !tokens?.accessToken,
  });

  // Initialize auth state from storage on app start
  useEffect(() => {
    // Try to restore auth state from storage
    const storedToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (storedToken && storedRefreshToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(restoreAuthState({
          user,
          tokens: {
            accessToken: storedToken,
            refreshToken: storedRefreshToken
          },
          rememberMe
        }));
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        dispatch(clearAuthState());
      }
    }
  }, [dispatch]);

  // Handle user validation results
  useEffect(() => {
    if (tokens && userError) {
      // If we have tokens but user validation failed, clear auth state
      console.log('Auth tokens invalid, clearing auth state');
      dispatch(clearAuthState());
    } else if (tokens && currentUser && !isAuthenticated) {
      // If we have valid user data but not authenticated, update auth state
      dispatch(loginSuccess({
        user: (currentUser as { user: User }).user,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType
        },
        rememberMe: localStorage.getItem('rememberMe') === 'true',
      }));
    }
  }, [tokens, userError, currentUser, isAuthenticated, dispatch]);

  // Auto-refresh user data periodically (every 5 minutes)
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      const interval = setInterval(() => {
        validateUser();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, tokens?.accessToken, validateUser]);

  return {
    isInitializing: isValidatingUser && !!tokens?.accessToken,
    isAuthenticated,
    user: currentUser,
  };
};