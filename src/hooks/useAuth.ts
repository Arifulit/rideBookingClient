import { useAppDispatch, useAppSelector } from '../redux/hook';
import { logout as logoutAction, setCredentials, updateUser, setLoading } from '../redux/features/auth/authSlice';
import { User } from '../types/auth';

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const login = (user: User, token: string) => {
    dispatch(setCredentials({ user: user as User, token }));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const updateProfile = (user: User) => {
    dispatch(updateUser(user as User));
  };

  const setLoadingState = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  // Helper function to check if user has specific role
  const hasRole = (role: string) => {
    return auth.user?.role === role;
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return auth.user?.role === 'admin';
  };

  // Helper function to check if user is driver
  const isDriver = () => {
    return auth.user?.role === 'driver';
  };

  // Helper function to check if user is rider
  const isRider = () => {
    return auth.user?.role === 'rider';
  };

  return {
    ...auth,
    login,
    logout,
    updateProfile,
    setLoadingState,
    hasRole,
    isAdmin,
    isDriver,
    isRider,
  };
};