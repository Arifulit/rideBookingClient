// import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
// import { toast } from "sonner";
// import { config } from "@/config/env";

// // Create axios instance with base configuration
// // ...existing code...
// export const axiosInstance = axios.create({
//   baseURL: config.api.baseURL,
//   timeout: config.api.timeout,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
// // ...existing code...

// // Response interceptor for error handling
// axiosInstance.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response;
//   },
//   (error: AxiosError) => {
//     // Handle different error cases
//     if (error.response?.status === 401) {
//       // clear stored tokens but DO NOT force immediate redirect
//       try {
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("token");
//         sessionStorage.removeItem("accessToken");
//         sessionStorage.removeItem("token");
//       } catch {
//         /* ignore storage errors */
//       }
//       toast.error("Session expired. Please login again.");

//       // Dispatch event so top-level can redirect after rehydration/profiles checked
//       try {
//         const ev = new CustomEvent("session:expired", { detail: { path: window.location.pathname } });
//         window.dispatchEvent(ev);
//       } catch {
//         window.dispatchEvent(new Event("session:expired"));
//       }
//       // don't call window.location.href here
//     } else if (error.response?.status === 403) {
//       toast.error("You don't have permission to perform this action.");
//     } else if (error.response?.status === 404) {
//       toast.error("The requested resource was not found.");
//     } else if (error.response?.status && error.response.status >= 500) {
//       toast.error("Server error. Please try again later.");
//     } else if (error.code === "ECONNABORTED") {
//       toast.error("Request timeout. Please check your connection.");
//     } else if (!error.response) {
//       toast.error("Network error. Please check your internet connection.");
//     }

//     return Promise.reject(error);
//   }
// );
// // ...existing code...

// // Response interceptor for error handling
// axiosInstance.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response;
//   },
//   (error: AxiosError) => {

//     // Handle different error cases
//     if (error.response?.status === 401) {
//       // localStorage.removeItem("token");
//       // localStorage.removeItem("user");
//       toast.error("Session expired. Please login again.");
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     } else if (error.response?.status === 403) {
//       toast.error("You don't have permission to perform this action.");
//     } else if (error.response?.status === 404) {
//       toast.error("The requested resource was not found.");
//     } else if (error.response?.status && error.response.status >= 500) {
//       toast.error("Server error. Please try again later.");
//     } else if (error.code === "ECONNABORTED") {
//       toast.error("Request timeout. Please check your connection.");
//     } else if (!error.response) {
//       toast.error("Network error. Please check your internet connection.");
//     }

//     return Promise.reject(error);
//   }
// );

// // Utility functions for API calls
// export const apiRequest = {
//   get: <T = unknown>(url: string, config?: object) => axiosInstance.get<T>(url, config),
//   post: <T = unknown>(url: string, data?: unknown, config?: object) => axiosInstance.post<T>(url, data, config),
//   put: <T = unknown>(url: string, data?: unknown, config?: object) => axiosInstance.put<T>(url, data, config),
//   patch: <T = unknown>(url: string, data?: unknown, config?: object) => axiosInstance.patch<T>(url, data, config),
//   delete: <T = unknown>(url: string, config?: object) => axiosInstance.delete<T>(url, config),
// };
// // Export configuration for external use
// export { config as axiosConfig };

// export default axiosInstance;


import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { config } from "@/config/env";

export const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
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
        request.headers.Authorization = `Bearer ${token}`;
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
  (error: AxiosError) => {
    const status = error.response?.status;

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

    // Handle unauthorized (401) - do not force immediate redirect
    if (status === 401) {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
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
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 404) {
      toast.error("The requested resource was not found.");
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