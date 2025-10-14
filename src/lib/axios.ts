
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { config } from "@/config/env";
// NOTE: Do not import store or auth actions at module top-level to avoid circular imports.
// We'll dynamically import them where needed (lazy) so `store` is available when used.

const normalizedBaseUrl = String(config.api.baseURL || '').replace(/\/+$/, '');
export const axiosInstance = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: config.api.timeout,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage if present
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
      try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (token && request.headers) {
        // Ensure we send raw token without 'Bearer ' prefix — backend expects the raw token
        const tokenClean = String(token).replace(/^Bearer\s+/i, '');
        request.headers.Authorization = `${tokenClean}`;
      }
    } catch {
      // ignore storage read errors
    }
    return request;
  },
  (err) => Promise.reject(err)
);

// Unified response interceptor (single)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = (error.config || {}) as InternalAxiosRequestConfig & { _retry?: boolean };

    // Token refresh mechanism queue
    type PendingPromise = {
      resolve: (value?: unknown) => void;
      reject: (err?: unknown) => void;
    };
    const refreshUrl = `${config.api.baseURL}/auth/refresh`;

    // Typed holders attached to axiosInstance to avoid module-scope globals duplication
    const typedInstance = axiosInstance as unknown as {
      __isRefreshing?: boolean;
      __refreshQueue?: PendingPromise[];
    };
    typedInstance.__isRefreshing = typedInstance.__isRefreshing ?? false;
    typedInstance.__refreshQueue = typedInstance.__refreshQueue ?? [];

    const processQueue = (errorObj: unknown, token: string | null) => {
      (typedInstance.__refreshQueue || []).forEach((p) => {
        if (errorObj) p.reject(errorObj);
        else p.resolve(token);
      });
      typedInstance.__refreshQueue = [];
    };

    // Handle rate limiting (429)
    if (status === 429) {
      const retryAfterHeader = error.response?.headers?.["retry-after"];
      const retrySeconds = retryAfterHeader ? parseInt(String(retryAfterHeader), 10) : 60;
      const waitMs = Number.isFinite(retrySeconds) && retrySeconds > 0 ? retrySeconds * 1000 : 60 * 1000;
      const unblockAt = Date.now() + waitMs;
      try {
        localStorage.setItem("loginRateLimitedUntil", String(unblockAt));
      } catch {
        // ignore
      }
      toast.error(`Too many login attempts. Try again in ${Math.ceil(waitMs / 1000)}s.`);
      return Promise.reject(error);
    }

    // Handle unauthorized (401) with token refresh attempt
    if (status === 401) {
      try {
        // If the request already attempted refresh, bail out and clear auth
        if (originalRequest._retry) {
          try {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("tokens");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("token");
          } catch {
            /* ignore */
          }
          toast.error("Session expired. Please login again.");
          try {
            const ev = new CustomEvent("session:expired", { detail: { path: window.location.pathname } });
            window.dispatchEvent(ev);
          } catch {
            window.dispatchEvent(new Event("session:expired"));
          }
          // Also clear Redux auth state when refresh fails
          try {
            const authModule = await import('@/redux/features/auth/authSlice');
            const storeModule = await import('@/redux/store');
            storeModule.default.dispatch(authModule.clearAuthState());
          } catch (dispatchErr) { console.warn('Failed dispatch clearAuthState', dispatchErr); }
          return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem('refreshToken') || '';
        if (!refreshToken) {
          // no refresh token available, force logout
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("tokens");
          } catch (err) { console.warn('Failed clearing storage during 401 handling', err); }
          toast.error("Session expired. Please login again.");
          try {
            const ev = new CustomEvent("session:expired", { detail: { path: window.location.pathname } });
            window.dispatchEvent(ev);
          } catch {
            window.dispatchEvent(new Event("session:expired"));
          }
          try {
            const authModule = await import('@/redux/features/auth/authSlice');
            const storeModule = await import('@/redux/store');
            storeModule.default.dispatch(authModule.clearAuthState());
          } catch (dispatchErr) { console.warn('Failed dispatch clearAuthState', dispatchErr); }
          return Promise.reject(error);
        }

        // If a refresh is already in progress, queue this request
        if (typedInstance.__isRefreshing) {
          return new Promise((resolve, reject) => {
            (typedInstance.__refreshQueue as PendingPromise[]).push({ resolve, reject });
          })
            .then((token) => {
              if (token && originalRequest.headers) {
                // Attach raw token (no 'Bearer ' prefix)
                originalRequest.headers.Authorization = String(token).replace(/^Bearer\s+/i, '');
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        // Start refresh
        typedInstance.__isRefreshing = true;
        originalRequest._retry = true;
        return new Promise((resolve, reject) => {
          (async () => {
            try {
              const resp = await axios.post(refreshUrl, { refreshToken });
              const newTokens = resp.data?.data || resp.data;
              const newAccess = newTokens?.tokens?.accessToken || newTokens?.accessToken || newTokens?.token || null;
              // Persist new tokens
              if (newAccess) {
                try {
                  // update localStorage and redux
                  const tokensToStore = newTokens.tokens || newTokens;
                  if (tokensToStore) localStorage.setItem('tokens', JSON.stringify(tokensToStore));
                  if (newAccess) localStorage.setItem('token', newAccess);
                  if (tokensToStore?.refreshToken) localStorage.setItem('refreshToken', tokensToStore.refreshToken);
                  // Dispatch to redux to update state if possible
                  try {
                    const authModule = await import('@/redux/features/auth/authSlice');
                    const storeModule = await import('@/redux/store');
                    storeModule.default.dispatch(authModule.loginSuccess({ user: resp.data?.data?.user || null, tokens: tokensToStore }));
                  } catch (dispatchErr) { console.warn('Dispatch loginSuccess failed', dispatchErr); }
                } catch (storageErr) { console.warn('Failed to persist new tokens', storageErr); }
              }

              // Process queued requests
              typedInstance.__isRefreshing = false;
              processQueue(null, newAccess);

              // Retry original request with new token
              if (newAccess && originalRequest.headers) {
                // Attach raw token (no 'Bearer ' prefix)
                originalRequest.headers.Authorization = String(newAccess).replace(/^Bearer\s+/i, '');
              }
              resolve(axiosInstance(originalRequest));
            } catch (errRefresh) {
              typedInstance.__isRefreshing = false;
              processQueue(errRefresh, null);
              try {
                localStorage.removeItem('token');
                localStorage.removeItem('tokens');
                localStorage.removeItem('refreshToken');
              } catch (cleanupErr) { console.warn('Failed cleanup after refresh failure', cleanupErr); }
              try {
                const authModule = await import('@/redux/features/auth/authSlice');
                const storeModule = await import('@/redux/store');
                storeModule.default.dispatch(authModule.clearAuthState());
              } catch (dispatchErr) { console.warn('Failed dispatch clearAuthState', dispatchErr); }
              try {
                const ev = new CustomEvent("session:expired", { detail: { path: window.location.pathname } });
                window.dispatchEvent(ev);
              } catch (evErr) { console.warn('Failed to dispatch session:expired event', evErr); }
              reject(errRefresh);
            }
          })();
        });
      } catch (err) {
        // fallback behavior: clear tokens and propagate original error
        console.warn('Error in 401 refresh fallback', err);
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
        } catch (cleanupErr) {
          console.warn('Failed clearing storage in fallback', cleanupErr);
        }
        toast.error("Session expired. Please login again.");
        try {
          const ev = new CustomEvent("session:expired", { detail: { path: window.location.pathname } });
          window.dispatchEvent(ev);
        } catch (evErr) {
          console.warn('Failed to dispatch session:expired in fallback', evErr);
          window.dispatchEvent(new Event("session:expired"));
        }
        try {
          const authModule = await import('@/redux/features/auth/authSlice');
          const storeModule = await import('@/redux/store');
          storeModule.default.dispatch(authModule.clearAuthState());
        } catch (dispatchErr) { console.warn('Failed to clear auth state in fallback', dispatchErr); }
        return Promise.reject(error);
      }
    }

    if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 404) {
      // Suppress user-facing toast for 404s; log instead for debugging
      console.warn('HTTP 404 Not Found:', error.config?.url, error.response?.data);
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please check your connection.");
    } else if (!error.response) {
      toast.error("Network error. Please check your internet connection.");
    }

    return Promise.reject(error);
  }
);

// Helpers for login UI
export const getLoginRateLimitedUntil = (): number | null => {
  try {
    const v = localStorage.getItem("loginRateLimitedUntil");
    if (!v) return null;
    const ts = Number(v);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
};
export const isLoginRateLimited = (): boolean => {
  const until = getLoginRateLimitedUntil();
  return !!until && Date.now() < until;
};


export default axiosInstance;