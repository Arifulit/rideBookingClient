/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { config } from "@/config/env";

type RequestConfigWithRetry<T = any> = InternalAxiosRequestConfig<T> & { _retry?: boolean; baseURL?: string; url?: string };

const normalizedBaseUrl = String(config.api.baseURL || "").replace(/\/+$/, "");
export const axiosInstance = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: config.api.timeout,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage for all requests (no route-specific exemptions)
axiosInstance.interceptors.request.use(
  (request: RequestConfigWithRetry<any>) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const tokensJson = localStorage.getItem("tokens");
      let tokenToUse = token;
      if (!tokenToUse && tokensJson) {
        try {
          const parsed = JSON.parse(tokensJson);
          tokenToUse = parsed?.accessToken || null;
        } catch {
          // ignore
        }
      }

      if (tokenToUse && request.headers) {
        request.headers.Authorization = String(tokenToUse).replace(/^Bearer\s+/i, "");
      }
    } catch {
      // ignore storage read errors
    }
    return request;
  },
  (err) => Promise.reject(err)
);

// Unified response interceptor (no special-case for /rides/estimate)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = (error.config || {}) as RequestConfigWithRetry<any> & { _retry?: boolean };

    // Token refresh queue helpers (unchanged)
    type PendingPromise = { resolve: (value?: unknown) => void; reject: (err?: unknown) => void };
    const refreshUrl = `${config.api.baseURL.replace(/\/+$/, "")}/auth/refresh`;

    const typedInstance = axiosInstance as unknown as { __isRefreshing?: boolean; __refreshQueue?: PendingPromise[] };
    typedInstance.__isRefreshing = typedInstance.__isRefreshing ?? false;
    typedInstance.__refreshQueue = typedInstance.__refreshQueue ?? [];

    const processQueue = (errorObj: unknown, token: string | null) => {
      (typedInstance.__refreshQueue || []).forEach((p) => {
        if (errorObj) p.reject(errorObj);
        else p.resolve(token);
      });
      typedInstance.__refreshQueue = [];
    };

    // Rate limit handling
    if (status === 429) {
      const retryAfterHeader = error.response?.headers?.["retry-after"];
      const retrySeconds = retryAfterHeader ? parseInt(String(retryAfterHeader), 10) : 60;
      const waitMs = Number.isFinite(retrySeconds) && retrySeconds > 0 ? retrySeconds * 1000 : 60 * 1000;
      const unblockAt = Date.now() + waitMs;
      try { localStorage.setItem("loginRateLimitedUntil", String(unblockAt)); } catch {}
      toast.error(`Too many login attempts. Try again in ${Math.ceil(waitMs / 1000)}s.`);
      return Promise.reject(error);
    }

    // 401 refresh flow (kept intact)
    if (status === 401) {
      try {
        if (originalRequest._retry) {
          try {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("tokens");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("token");
          } catch {}
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
          } catch {}
          return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refreshToken") || "";
        if (!refreshToken) {
          try {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("tokens");
          } catch {}
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
          } catch {}
          return Promise.reject(error);
        }

        if (typedInstance.__isRefreshing) {
          return new Promise((resolve, reject) => {
            (typedInstance.__refreshQueue as PendingPromise[]).push({ resolve, reject });
          })
            .then((token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = String(token).replace(/^Bearer\s+/i, '');
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        typedInstance.__isRefreshing = true;
        originalRequest._retry = true;
        return new Promise((resolve, reject) => {
          (async () => {
            try {
              const resp = await axios.post(refreshUrl, { refreshToken });
              const newTokens = resp.data?.data || resp.data;
              const newAccess = newTokens?.tokens?.accessToken || newTokens?.accessToken || newTokens?.token || null;

              if (newAccess) {
                try {
                  const tokensToStore = newTokens.tokens || newTokens;
                  if (tokensToStore) localStorage.setItem('tokens', JSON.stringify(tokensToStore));
                  if (newAccess) localStorage.setItem('token', newAccess);
                  if (tokensToStore?.refreshToken) localStorage.setItem('refreshToken', tokensToStore.refreshToken);
                  try {
                    const authModule = await import('@/redux/features/auth/authSlice');
                    const storeModule = await import('@/redux/store');
                    storeModule.default.dispatch(authModule.loginSuccess({ user: resp.data?.data?.user || null, tokens: tokensToStore }));
                  } catch {}
                } catch {}
              }

              typedInstance.__isRefreshing = false;
              processQueue(null, newAccess);

              if (newAccess && originalRequest.headers) {
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
              } catch {}
              try {
                const authModule = await import('@/redux/features/auth/authSlice');
                const storeModule = await import('@/redux/store');
                storeModule.default.dispatch(authModule.clearAuthState());
              } catch {}
              try {
                const ev = new CustomEvent("session:expired", { detail: { path: window.location.pathname } });
                window.dispatchEvent(ev);
              } catch {}
              reject(errRefresh);
            }
          })();
        });
      } catch {
        try { localStorage.removeItem("accessToken"); localStorage.removeItem("token"); } catch {}
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
        } catch {}
        return Promise.reject(error);
      }
    }

    // Other status handling
    if (status === 403) {
      // permission denied - optional handling
    } else if (status === 404) {
      // suppress user-facing toast for 404s
      console.warn('HTTP 404 Not Found:', error.config?.url);
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