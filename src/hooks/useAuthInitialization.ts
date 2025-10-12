import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useGetProfileQuery } from '@/redux/features/user/user.api';
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
    data: profileWrapper,
    isLoading: isValidatingUser,
    error: userError,
    refetch: validateUser,
  } = useGetProfileQuery(undefined, {
    skip: !tokens?.accessToken,
  });

  // Normalize backend shape: sometimes returns { user } inside data or returns user directly
  const fetchedUser = profileWrapper && (profileWrapper.user || profileWrapper) as unknown as User | null;

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
    } else if (tokens && fetchedUser && !isAuthenticated) {
      // If we have valid user data but not authenticated, update auth state
      dispatch(loginSuccess({
        user: fetchedUser,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType
        },
        rememberMe: localStorage.getItem('rememberMe') === 'true',
      }));
    }
  }, [tokens, userError, fetchedUser, isAuthenticated, dispatch]);

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
    user: fetchedUser,
  };
};