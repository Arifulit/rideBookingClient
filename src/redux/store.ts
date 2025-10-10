import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { adminApi } from './features/admin/adminApi';
import { riderApi } from './features/rider/riderApi';
// APIs are injected into baseApi, so no need to import them separately
import authReducer from './features/auth/authSlice';
import riderReducer from './features/rider/riderSlice';
import driverReducer from './features/driver/driverSlice';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Store configuration options
const isDevelopment = import.meta.env.MODE === 'development';

// Performance monitoring middleware
const performanceMiddleware: Middleware = () => (next) => (action: unknown) => {
  const typedAction = action as { type?: string };
  if (isDevelopment && typedAction.type) {
    const start = performance.now();
    const result = next(action);
    const end = performance.now();

    if (end - start > 16) {
      console.warn(`Slow action detected: ${typedAction.type} took ${end - start}ms`);
    }

    return result;
  }
  return next(action);
};

// Persistence configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['isLoading', 'error'], // Don't persist loading states and errors
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Enable Redux DevTools Extension
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof import('redux').compose;
    __STORE__?: typeof store;
  }
}

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  rider: riderReducer,
    driver: driverReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  [riderApi.reducerPath]: riderApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // RTK Query actions are handled automatically
        ],
        ignoredActionPaths: ['payload.timestamp', 'meta.baseQueryMeta', 'meta.arg'],
        ignoredPaths: ['auth.user.lastLoginAt', 'driver.currentLocation', 'api.queries', 'api.mutations'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
      actionCreatorCheck: true,
    });
    
    return defaultMiddleware.concat(baseApi.middleware, riderApi.middleware, adminApi.middleware, performanceMiddleware);
  },
  devTools: isDevelopment ? {
    name: 'Ride Booking App',
    trace: true,
    traceLimit: 25,
    maxAge: 50,
    serialize: true,
  } : false,
});

// Enable listener behavior for RTK Query
setupListeners(store.dispatch);

// Persist the store
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Helper function to get current state
export const getCurrentState = (): RootState => store.getState();

// Helper function for dispatching actions
export const dispatchAction = (action: Parameters<AppDispatch>[0]) => store.dispatch(action);

// Error handling utility
export const handleStoreError = (error: Error, logToExternalService?: (err: Error) => void) => {
  console.error('Redux Store Error:', error);
  if (isDevelopment) {
    console.trace(error);
  }
  if (logToExternalService && typeof logToExternalService === 'function') {
    logToExternalService(error);
  }
};

// Store subscription utility
export const subscribeToStore = (callback: () => void) => store.subscribe(callback);

// Async state waiting utility
export const waitForState = <T>(selector: (state: RootState) => T, expectedValue: T): Promise<void> => {
  return new Promise((resolve) => {
    const unsubscribe = store.subscribe(() => {
      if (selector(store.getState()) === expectedValue) {
        unsubscribe();
        resolve();
      }
    });
  });
};

// Re-export auth actions (commented out due to import issues)
// export { logout, setLoading };

// Import User type for proper typing
import { User } from '@/types/auth';

// State selectors - handle PersistPartial properly
interface AuthStateWithPersist {
  user?: User | null;
  isAuthenticated?: boolean;
  tokens?: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
  } | null;
  isLoading?: boolean;
  [key: string]: unknown;
}

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState): User | null => (state.auth as unknown as AuthStateWithPersist).user || null;
export const selectIsAuthenticated = (state: RootState): boolean => Boolean((state.auth as unknown as AuthStateWithPersist).isAuthenticated);
export const selectAuthTokens = (state: RootState) => (state.auth as unknown as AuthStateWithPersist).tokens || null;
export const selectAuthLoading = (state: RootState): boolean => Boolean((state.auth as unknown as AuthStateWithPersist).isLoading);

// Store reset utility (useful for logout)
export const resetStore = () => {
  dispatchAction({ type: 'auth/logout' });
  persistor.purge(); // Clear persisted state on logout
};

// Store hydration utility
export const hydrateStore = (preloadedState: Partial<RootState>) => {
  store.dispatch({ type: 'HYDRATE_STORE', payload: preloadedState });
  if (isDevelopment) {
    console.log('Store hydrated with:', preloadedState);
  }
};

// Development utilities
if (isDevelopment) {
  window.__STORE__ = store;
  console.log('Initial store state:', store.getState());
}

// Export the store as default
export default store;





