import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthTokens } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  tokens: null,
  isAuthenticated: false,
  loading: true, // Start with loading true to prevent redirects during persist rehydration
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log("🔄 Redux: setCredentials called with payload:", {
        hasUser: !!action.payload.user,
        hasToken: !!action.payload.token,
        hasTokens: !!action.payload.tokens,
        userRole: action.payload.user?.role
      });

      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      
      // Handle both old and new token structure
      if (action.payload.tokens) {
        state.tokens = action.payload.tokens;
        state.token = action.payload.tokens.accessToken; // Keep backward compatibility
        console.log("🔑 Redux: Tokens structure set successfully");
      } else if (action.payload.token) {
        state.tokens = {
          accessToken: action.payload.token,
          refreshToken: action.payload.refreshToken || '',
          expiresIn: 3600, // Default 1 hour
          tokenType: 'Bearer',
        };
        console.log("🔑 Redux: Legacy token converted to tokens structure");
      }
      
      state.isAuthenticated = true;
      state.loading = false;
      
      console.log("✅ Redux: Auth state updated - isAuthenticated:", state.isAuthenticated);
      
      // Backup to localStorage for recovery
      try {
        localStorage.setItem('token', state.token || '');
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (state.refreshToken) {
          localStorage.setItem('refreshToken', state.refreshToken);
        }
        if (state.tokens) {
          localStorage.setItem('tokens', JSON.stringify(state.tokens));
        }
      } catch (error) {
        console.warn('Failed to backup auth to localStorage:', error);
      }
    },
    loginSuccess: (state, action) => {
      console.log("🎉 Redux: loginSuccess called with payload:", {
        hasUser: !!action.payload.user,
        hasTokens: !!action.payload.tokens,
        accessToken: action.payload.tokens?.accessToken ? "Present" : "Missing",
        refreshToken: action.payload.tokens?.refreshToken ? "Present" : "Missing",
        userRole: action.payload.user?.role
      });

      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.token = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken || null;
      state.isAuthenticated = true;
      state.loading = false;
      
      console.log("✅ Redux: Login success - isAuthenticated:", state.isAuthenticated);
      console.log("🔑 Redux: Access token set:", !!state.token);
      
      // 🏪 REDUX STATE - COMPLETE TOKEN DETAILS
      console.log("🏪 ===== REDUX STATE - COMPLETE TOKEN UPDATE =====");
      console.log("🎫 Complete Tokens Object in Redux:", state.tokens);
      console.log("🔑 Individual Token (legacy):", state.token);
      console.log("🔄 Refresh Token:", state.refreshToken);
      console.log("👤 User in Redux State:", state.user);
      console.log("✅ Authentication Status:", state.isAuthenticated);
      console.log("⏳ Loading Status:", state.loading);
      console.log("🏪 ===== END REDUX STATE UPDATE =====");
      
      // Backup to localStorage for recovery
      try {
        localStorage.setItem('token', state.token || '');
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('tokens', JSON.stringify(state.tokens));
        if (state.refreshToken) {
          localStorage.setItem('refreshToken', state.refreshToken);
        }
        console.log("💾 Redux: Successfully backed up auth data to localStorage");
      } catch (error) {
        console.warn('Failed to backup auth to localStorage:', error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null; 
      state.tokens = null;
      state.isAuthenticated = false;
      state.loading = false;
      
      // Clear backup storage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokens');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tokens');
      } catch (error) {
        console.warn('Failed to clear auth from storage:', error);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    rehydrateAuth: (state) => {
      state.loading = false;
    },
    restoreAuthState: (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.token = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken || null;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null; 
      state.tokens = null;
      state.isAuthenticated = false;
      state.loading = false;
      
      // Clear backup storage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokens');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tokens');
        sessionStorage.removeItem('accessToken');
      } catch (error) {
        console.warn('Failed to clear auth from storage:', error);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type === 'persist/REHYDRATE',
      (state, action: { payload?: { auth?: AuthState } }) => {
        state.loading = false;
        console.log('Persist rehydrated auth state:', action.payload?.auth);
      }
    );
  },
});

export const { setCredentials, loginSuccess, logout, setLoading, updateUser, rehydrateAuth, restoreAuthState, clearAuthState } = authSlice.actions;

// Selectors - Note: These are deprecated, use selectors from store.ts instead
interface RootState {
  auth: AuthState;
}

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectTokens = (state: RootState) => state.auth.tokens;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer;