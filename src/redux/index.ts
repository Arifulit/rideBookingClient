// Store and types
export { store } from "./store";
export type { RootState, AppDispatch } from "./store";

// Typed hooks
export { useAppDispatch, useAppSelector } from "./hook";

// Auth API and types
export {
  authApi,
  useLoginMutation,
  useRegisterMutation,
} from "./features/auth/authApi";

// Auth slice actions
export {
  setCredentials,
  logout,
  updateUser,
  setLoading,
} from "./features/auth/authSlice";