/* eslint-disable @typescript-eslint/no-explicit-any */
// import { axiosInstance } from "@/lib/axios";
// import { BaseQueryFn } from "@reduxjs/toolkit/query";
// import { AxiosError, AxiosRequestConfig } from "axios";

// const axiosBaseQuery =
//   (): BaseQueryFn<
//     {
//       url: string;
//       method?: AxiosRequestConfig["method"];
//       data?: AxiosRequestConfig["data"];
//       params?: AxiosRequestConfig["params"];
//       headers?: AxiosRequestConfig["headers"];
//     },
//     unknown,
//     unknown
//   > =>
//   async ({ url, method, data, params, headers }) => {
//     try {
//       console.log("🌐 === AXIOS REQUEST ===");
//       console.log("🌐 axiosBaseQuery - Request URL:", url);
//       console.log("🌐 axiosBaseQuery - Method:", method);
//       console.log(
//         "🌐 axiosBaseQuery - Data:",
//         data ? JSON.stringify(data, null, 2) : "No data"
//       );
//       console.log("🌐 axiosBaseQuery - Params:", params);
//       console.log("🌐 axiosBaseQuery - Headers:", headers);

//       const result = await axiosInstance({
//         url: url,
//         method,
//         data,
//         params,
//         headers,
//       });

//       console.log("✅ === AXIOS RESPONSE SUCCESS ===");
//       console.log("✅ axiosBaseQuery - Response Status:", result.status);
//       console.log(
//         "✅ axiosBaseQuery - Response Data:",
//         JSON.stringify(result.data, null, 2)
//       );

//       // Special token logging for auth endpoints
//       if (url?.includes("/auth/") && result.data?.data?.tokens) {
//         console.log("🎫 === AXIOS AUTH TOKEN DETECTION ===");
//         console.log(
//           "🎯 Detected Access Token:",
//           result.data.data.tokens.accessToken
//         );
//         console.log(
//           "🔄 Detected Refresh Token:",
//           result.data.data.tokens.refreshToken
//         );
//         console.log("🎫 === END AUTH TOKEN DETECTION ===");
//       }

//       return { data: result.data };
//     } catch (axiosError) {
//       const err = axiosError as AxiosError;

//       console.log("❌ === AXIOS ERROR ===");
//       console.log("❌ axiosBaseQuery - Error Status:", err.response?.status);
//       console.log(
//         "❌ axiosBaseQuery - Error Data:",
//         JSON.stringify(err.response?.data, null, 2)
//       );
//       console.log("❌ axiosBaseQuery - Error Message:", err.message);
//       // If the driver ride history endpoint is missing on the backend, return a safe empty shape
//       // so the UI can render an empty list instead of crashing.
//       if (
//         err.response?.status === 404 &&
//         url?.includes("/drivers/rides/history")
//       ) {
//         console.warn(
//           "⚠️ axiosBaseQuery - 404 on driver ride history, returning empty fallback payload"
//         );
//         const p = (params || {}) as Record<string, unknown>;
//         const limit = Number(p.limit ?? 10);
//         const page = Number(p.page ?? 1);
//         return {
//           data: {
//             rides: [],
//             pagination: {
//               currentPage: page,
//               totalPages: 0,
//               totalItems: 0,
//               itemsPerPage: limit,
//             },
//             filters: {},
//           },
//         };
//       }

//       return {
//         error: {
//           status: err.response?.status,
//           data: err.response?.data || err.message,
//         },
//       };
//     }
//   };

// export default axiosBaseQuery;
// ...existing code...
import { axiosInstance } from "@/lib/axios";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError, AxiosRequestConfig } from "axios";

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      console.log("🌐 === AXIOS REQUEST ===");
      console.log("🌐 axiosBaseQuery - Request URL:", url);
      console.log("🌐 axiosBaseQuery - Method:", method);
      console.log(
        "🌐 axiosBaseQuery - Data:",
        data ? JSON.stringify(data, null, 2) : "No data"
      );
      console.log("🌐 axiosBaseQuery - Params:", params);
      console.log("🌐 axiosBaseQuery - Headers (caller):", headers);

      // Attach token (Bearer) if present in localStorage
      let token: string | null = null;
      try {
        token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      } catch {
        token = null;
      }

      const mergedHeaders = {
        ...(headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const result = await axiosInstance.request({
        url,
        method,
        data,
        params,
        headers: mergedHeaders,
      });

      console.log("✅ === AXIOS RESPONSE SUCCESS ===");
      console.log("✅ axiosBaseQuery - Response Status:", result.status);
      console.log(
        "✅ axiosBaseQuery - Response Data:",
        JSON.stringify(result.data, null, 2)
      );

      // If backend wraps payload in { data: ... }, unwrap it for RTK Query consumers
      const body = result.data;
      const payload = body && typeof body === "object" && "data" in body ? (body as any).data : body;

      // Log tokens when auth endpoint returns them
      if (url?.includes("/auth/") && (payload?.tokens || (body as any)?.data?.tokens)) {
        const tokens = payload?.tokens ?? (body as any)?.data?.tokens;
        console.log("🎫 === AXIOS AUTH TOKEN DETECTION ===");
        if (tokens?.accessToken) console.log("🎯 Detected Access Token:", tokens.accessToken);
        if (tokens?.refreshToken) console.log("🔄 Detected Refresh Token:", tokens.refreshToken);
        console.log("🎫 === END AUTH TOKEN DETECTION ===");
      }

      return { data: payload };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      console.log("❌ === AXIOS ERROR ===");
      console.log("❌ axiosBaseQuery - Error Status:", err.response?.status);
      console.log(
        "❌ axiosBaseQuery - Error Data:",
        JSON.stringify(err.response?.data ?? err.message, null, 2)
      );
      console.log("❌ axiosBaseQuery - Error Message:", err.message);

      const status = err.response?.status ?? 500;
      const respData = err.response?.data ?? err.message;

      // Fallback: if active ride endpoint missing, return null (no active ride)
      if (status === 404 && url?.includes("/driver/ride/active")) {
        console.warn("⚠️ axiosBaseQuery - 404 on active ride, returning null fallback");
        return { data: null };
      }

      // Fallback: if driver ride history endpoint missing, return empty paginated shape
      if (
        status === 404 &&
        (url?.includes("/driver/rides/history") || url?.includes("/drivers/rides/history"))
      ) {
        console.warn(
          "⚠️ axiosBaseQuery - 404 on driver ride history, returning empty fallback payload"
        );
        const p = (params || {}) as Record<string, unknown>;
        const limit = Number(p.limit ?? 10);
        const page = Number(p.page ?? 1);
        return {
          data: {
            rides: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: limit,
            },
            filters: {},
          },
        };
      }

      // Rate limit handling: store unblock time for login UI
      if (status === 429) {
        const retryAfterHeader = (err.response?.headers as any)?.["retry-after"];
        const retrySeconds = retryAfterHeader ? parseInt(String(retryAfterHeader), 10) : 60;
        const waitMs = Number.isFinite(retrySeconds) && retrySeconds > 0 ? retrySeconds * 1000 : 60 * 1000;
        try {
          localStorage.setItem("loginRateLimitedUntil", String(Date.now() + waitMs));
        } catch {
          /* ignore */
        }
      }

      // Unauthorized handling: clear tokens and notify app for protected endpoints (skip auth routes)
      if (status === 401 && !String(url).includes("/auth/")) {
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("token");
        } catch {
          /* ignore */
        }
        try {
          const ev = new CustomEvent("session:expired", { detail: { path: window.location.pathname } });
          window.dispatchEvent(ev);
        } catch {
          window.dispatchEvent(new Event("session:expired"));
        }
      }

      return {
        error: {
          status,
          data: respData,
        },
      };
    }
  };

export default axiosBaseQuery;
// ...existing code...