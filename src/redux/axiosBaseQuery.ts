/* eslint-disable @typescript-eslint/no-explicit-any */

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
  async ({ url, method, data, params, headers }) => {
    let lastRequestConfig: AxiosRequestConfig | undefined;
    try {
      const resolvedMethod = (method || "GET") as AxiosRequestConfig["method"];
      const resolvedHeaders = headers || {};
      const providedHeaders = { ...(resolvedHeaders as Record<string, unknown>) };

      // Normalize provided Authorization header (strip leading "Bearer ")
      try {
        const authKey = providedHeaders["Authorization"]
          ? "Authorization"
          : providedHeaders["authorization"]
          ? "authorization"
          : null;
        if (authKey) {
          const rawVal = String(providedHeaders[authKey] ?? "").replace(/^Bearer\s+/i, "");
          providedHeaders[authKey] = rawVal;
          const masked = `${rawVal.slice(0, 20)}...`;
          console.log("🌐 axiosBaseQuery - Normalized provided Authorization header (masked):", masked);
        }
      } catch {
        // ignore
      }

      // Recover token from localStorage if not provided
      if (!providedHeaders["Authorization"] && !providedHeaders["authorization"]) {
        const lsToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const lsTokensJson = localStorage.getItem("tokens");
        let recovered: string | null = null;
        try {
          if (lsTokensJson) {
            const parsed = JSON.parse(lsTokensJson);
            recovered = parsed?.accessToken || null;
          }
        } catch {
          // ignore
        }
        const tokenToUse = recovered || lsToken || null;
        if (tokenToUse) {
          const tokenClean = String(tokenToUse).replace(/^Bearer\s+/i, "");
          providedHeaders["Authorization"] = tokenClean;
          const masked = `${String(tokenClean).slice(0, 20)}...`;
          console.log("🌐 axiosBaseQuery - Recovered Authorization (masked):", masked);
        } else {
          console.log("🌐 axiosBaseQuery - No Authorization found in provided headers or localStorage");
        }
      }

      // Normalize path differences: /rides/history -> /users/rides/history
      let normalizedUrl = url;
      try {
        const methodNorm = String(resolvedMethod || "GET").toUpperCase();
        if (typeof normalizedUrl === "string" && methodNorm === "GET" && normalizedUrl.endsWith("/rides/history")) {
          normalizedUrl = normalizedUrl.replace("/rides/history", "/users/rides/history");
          console.log("🌐 axiosBaseQuery - Remapped URL /rides/history -> /users/rides/history");
        }
      } catch {
        // ignore
      }

      // --- Normalize & validate driver endpoints to avoid common 400s ---
      try {
        const methodNorm = String(resolvedMethod || "GET").toUpperCase();
        if (
          typeof normalizedUrl === "string" &&
          (methodNorm === "PATCH" || methodNorm === "POST" || methodNorm === "PUT")
        ) {
          const isOnlineStatus = normalizedUrl.endsWith("/drivers/online-status");
          const isAvailability = normalizedUrl.endsWith("/drivers/availability");
          if (isOnlineStatus || isAvailability) {
            // Accept primitive boolean, alias shapes or objects.
            let body: Record<string, unknown> | undefined;
            if (typeof data === "boolean") {
              body = isOnlineStatus ? { isOnline: data } : { available: data };
            } else if (data && typeof data === "object") {
              body = { ...(data as Record<string, unknown>) };
            } else {
              // no body provided — forward to backend for validation (do not abort here)
              body = undefined;
            }

            if (body) {
              if (isOnlineStatus) {
                // normalize to { isOnline: boolean }
                if (!("isOnline" in body)) {
                  if ("online" in body) {
                    body.isOnline = Boolean((body as any).online === true || (body as any).online === "true" || (body as any).online === 1 || (body as any).online === "1");
                  } else if ("status" in body) {
                    const s = String((body as any).status).toLowerCase();
                    body.isOnline = s === "online" || s === "1" || s === "true";
                  }
                } else {
                  body.isOnline = Boolean((body as any).isOnline === true || (body as any).isOnline === "true" || (body as any).isOnline === 1 || (body as any).isOnline === "1");
                }
                delete (body as any).online;
                delete (body as any).status;
              } else {
                // normalize to { available: boolean }
                if (!("available" in body)) {
                  if ("isAvailable" in body) {
                    body.available = Boolean((body as any).isAvailable === true || (body as any).isAvailable === "true" || (body as any).isAvailable === 1 || (body as any).isAvailable === "1");
                  } else if ("status" in body) {
                    const s = String((body as any).status).toLowerCase();
                    body.available = s === "available" || s === "online" || s === "1" || s === "true";
                  }
                } else {
                  body.available = Boolean((body as any).available === true || (body as any).available === "true" || (body as any).available === 1 || (body as any).available === "1");
                }
                delete (body as any).isAvailable;
                delete (body as any).status;
              }

              // ensure JSON content-type and use normalized body
              providedHeaders["Content-Type"] = (providedHeaders["Content-Type"] as string) || "application/json";
              data = body;
              console.debug("🌐 axiosBaseQuery - Normalized body for", normalizedUrl, data);
            } else {
              console.warn(`🌐 axiosBaseQuery - No body provided for ${normalizedUrl}; forwarding to backend for validation`);
            }
          }
        }
      } catch (e) {
        console.warn("🌐 axiosBaseQuery - driver endpoint normalization failed", e);
      }

      // --- end normalization ---

      const requestConfig: AxiosRequestConfig = {
        url: normalizedUrl,
        method: resolvedMethod,
        data,
        params,
        headers: providedHeaders as AxiosRequestConfig["headers"],
      };
      lastRequestConfig = requestConfig;

      console.log("🌐 === AXIOS REQUEST ===");
      console.log("🌐 axiosBaseQuery - Request URL:", normalizedUrl);
      console.log("🌐 axiosBaseQuery - Resolved Method:", resolvedMethod);
      console.log("🌐 axiosBaseQuery - Data:", data ? JSON.stringify(data, null, 2) : "No data");
      console.log("🌐 axiosBaseQuery - Params:", params || "No params");
      console.log("🌐 axiosBaseQuery - Resolved Headers:", resolvedHeaders);
      try {
        const headersMap = resolvedHeaders as Record<string, unknown>;
        const authHeader = headersMap && (headersMap["Authorization"] || headersMap["authorization"]);
        console.log("🌐 axiosBaseQuery - Authorization present (in provided headers):", !!authHeader);
      } catch {
        // ignore
      }

      const result = await axiosInstance.request(requestConfig);

      console.log("✅ === AXIOS RESPONSE SUCCESS ===");
      console.log("✅ axiosBaseQuery - Response Status:", result.status);
      console.log("✅ axiosBaseQuery - Response Data:", JSON.stringify(result.data, null, 2));
      try {
        console.log("✅ axiosBaseQuery - Response Headers:", result.headers);
        console.log("✅ axiosBaseQuery - Full Response:", result);
      } catch {
        console.log("✅ axiosBaseQuery - Could not stringify full response");
      }

      const tokensDetected = result.data?.data?.tokens || result.data?.tokens;
      if (normalizedUrl?.includes("/auth/") && tokensDetected) {
        console.log("🎫 === AXIOS AUTH TOKEN DETECTION ===");
        console.log("🎯 Detected Access Token:", tokensDetected.accessToken);
        console.log("🔄 Detected Refresh Token:", tokensDetected.refreshToken);
        console.log("🎫 === END AUTH TOKEN DETECTION ===");
      }

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      console.log("❌ === AXIOS ERROR ===");
      console.log("❌ axiosBaseQuery - Error Message:", err.message);
      console.log("❌ axiosBaseQuery - Error HTTP Status:", err.response?.status);

      try {
        console.log("❌ axiosBaseQuery - Error Response Data:", JSON.stringify(err.response?.data, null, 2));
      } catch {
        console.log("❌ axiosBaseQuery - Error Response Data: (unserializable)");
      }

      if (err.response?.status === 404 && url?.includes("/drivers/rides/history")) {
        console.warn("⚠️ axiosBaseQuery - 404 on driver ride history, returning empty fallback payload");
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

      const rawHeaders = err.response?.headers;
      let serializableHeaders: Record<string, string> | undefined;
      try {
        if (rawHeaders) {
          serializableHeaders = {};
          for (const key of Object.keys(rawHeaders as Record<string, unknown>)) {
            const val = (rawHeaders as Record<string, unknown>)[key];
            serializableHeaders[key] = typeof val === "string" ? val : JSON.stringify(val);
          }
        }
      } catch {
        serializableHeaders = undefined;
      }

      const requestInfo = lastRequestConfig
        ? {
            url: lastRequestConfig.url,
            method: String(lastRequestConfig.method || "GET"),
            params: lastRequestConfig.params ?? null,
            data: lastRequestConfig.data ?? null,
            headers: lastRequestConfig.headers ?? null,
          }
        : { url };

      const responseDataUnknown: unknown = err.response?.data;
      const responseMessage =
        typeof responseDataUnknown === "object" && responseDataUnknown !== null && "message" in (responseDataUnknown as Record<string, unknown>)
          ? String((responseDataUnknown as Record<string, unknown>)["message"])
          : undefined;

      const errorPayload = {
        status: err.response?.status ?? null,
        statusText: err.response?.statusText ?? null,
        code: err.code ?? null,
        message: responseMessage ?? err.message,
        data: responseDataUnknown ?? null,
        headers: serializableHeaders ?? null,
        request: requestInfo,
        timestamp: new Date().toISOString(),
      } as const;

      try {
        console.error("❌ axiosBaseQuery - Structured Error Payload:", JSON.stringify(errorPayload, null, 2));
      } catch {
        console.error("❌ axiosBaseQuery - Error Payload (unserializable) - falling back to printing pieces");
        console.error("status:", errorPayload.status, "message:", errorPayload.message);
      }

      return {
        error: {
          status: errorPayload.status,
          data: errorPayload,
        },
      };
    }
  };

export default axiosBaseQuery;




















// /* eslint-disable @typescript-eslint/no-explicit-any */
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
//     let lastRequestConfig: AxiosRequestConfig | undefined;

//     try {
//       const resolvedMethod = (method || "GET") as AxiosRequestConfig["method"];
//       const resolvedHeaders = headers || {};
//       const providedHeaders = { ...(resolvedHeaders as Record<string, unknown>) };

//       // Normalize provided Authorization header (strip leading "Bearer ")
//       try {
//         const authKey = providedHeaders["Authorization"]
//           ? "Authorization"
//           : providedHeaders["authorization"]
//           ? "authorization"
//           : null;
//         if (authKey) {
//           const rawVal = String(providedHeaders[authKey] ?? "").replace(/^Bearer\s+/i, "");
//           providedHeaders[authKey] = rawVal;
//         }
//       } catch {
//         // ignore
//       }

//       // Recover token from localStorage if not provided
//       if (!providedHeaders["Authorization"] && !providedHeaders["authorization"]) {
//         const lsToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
//         const lsTokensJson = localStorage.getItem("tokens");
//         let recovered: string | null = null;
//         try {
//           if (lsTokensJson) {
//             const parsed = JSON.parse(lsTokensJson);
//             recovered = parsed?.accessToken || null;
//           }
//         } catch {
//           // ignore
//         }
//         const tokenToUse = recovered || lsToken || null;
//         if (tokenToUse) {
//           const tokenClean = String(tokenToUse).replace(/^Bearer\s+/i, "");
//           providedHeaders["Authorization"] = tokenClean;
//         }
//       }

//       // Normalize path differences: /rides/history -> /users/rides/history
//       let normalizedUrl: string | undefined = typeof url === "string" ? url : undefined;
//       try {
//         const methodNorm = String(resolvedMethod || "GET").toUpperCase();
//         if (typeof normalizedUrl === "string" && methodNorm === "GET" && normalizedUrl.endsWith("/rides/history")) {
//           normalizedUrl = normalizedUrl.replace("/rides/history", "/users/rides/history");
//         }
//       } catch {
//         // ignore
//       }

//       // Normalize driver endpoints payload shapes to avoid common 400s
//       try {
//         const methodNorm = String(resolvedMethod || "GET").toUpperCase();
//         if (
//           typeof normalizedUrl === "string" &&
//           (methodNorm === "PATCH" || methodNorm === "POST" || methodNorm === "PUT")
//         ) {
//           const isOnlineStatus = normalizedUrl.endsWith("/drivers/online-status");
//           const isAvailability = normalizedUrl.endsWith("/drivers/availability");
//           if (isOnlineStatus || isAvailability) {
//             let body: Record<string, unknown> | undefined;
//             if (typeof data === "boolean") {
//               body = isOnlineStatus ? { isOnline: data } : { available: data };
//             } else if (data && typeof data === "object") {
//               body = { ...(data as Record<string, unknown>) };
//             } else {
//               body = undefined;
//             }

//             if (body) {
//               if (isOnlineStatus) {
//                 if (!("isOnline" in body)) {
//                   if ("online" in body) {
//                     body.isOnline = Boolean(
//                       (body as any).online === true ||
//                         (body as any).online === "true" ||
//                         (body as any).online === 1 ||
//                         (body as any).online === "1"
//                     );
//                   } else if ("status" in body) {
//                     const s = String((body as any).status).toLowerCase();
//                     body.isOnline = s === "online" || s === "1" || s === "true";
//                   }
//                 } else {
//                   body.isOnline = Boolean(
//                     (body as any).isOnline === true ||
//                       (body as any).isOnline === "true" ||
//                       (body as any).isOnline === 1 ||
//                       (body as any).isOnline === "1"
//                   );
//                 }
//                 delete (body as any).online;
//                 delete (body as any).status;
//               } else {
//                 if (!("available" in body)) {
//                   if ("isAvailable" in body) {
//                     body.available = Boolean(
//                       (body as any).isAvailable === true ||
//                         (body as any).isAvailable === "true" ||
//                         (body as any).isAvailable === 1 ||
//                         (body as any).isAvailable === "1"
//                     );
//                   } else if ("status" in body) {
//                     const s = String((body as any).status).toLowerCase();
//                     body.available = s === "available" || s === "online" || s === "1" || s === "true";
//                   }
//                 } else {
//                   body.available = Boolean(
//                     (body as any).available === true ||
//                       (body as any).available === "true" ||
//                       (body as any).available === 1 ||
//                       (body as any).available === "1"
//                   );
//                 }
//                 delete (body as any).isAvailable;
//                 delete (body as any).status;
//               }

//               providedHeaders["Content-Type"] = (providedHeaders["Content-Type"] as string) || "application/json";
//               data = body;
//             }
//           }
//         }
//       } catch {
//         // ignore
//       }

//       const requestConfig: AxiosRequestConfig = {
//         url: normalizedUrl ?? url,
//         method: resolvedMethod,
//         data,
//         params,
//         headers: providedHeaders as AxiosRequestConfig["headers"],
//       };
//       lastRequestConfig = requestConfig;

//       const result = await axiosInstance.request(requestConfig);

//       return { data: result.data };
//     } catch (axiosError) {
//       const err = axiosError as AxiosError;

//       // Provide empty fallback for driver ride history 404
//       try {
//         if (err.response?.status === 404 && typeof url === "string" && url.includes("/drivers/rides/history")) {
//           const p = (params || {}) as Record<string, unknown>;
//           const limit = Number(p.limit ?? 10);
//           const page = Number(p.page ?? 1);
//           return {
//             data: {
//               rides: [],
//               pagination: {
//                 currentPage: page,
//                 totalPages: 0,
//                 totalItems: 0,
//                 itemsPerPage: limit,
//               },
//               filters: {},
//             },
//           };
//         }
//       } catch {
//         // ignore
//       }

//       const rawHeaders = err.response?.headers;
//       let serializableHeaders: Record<string, string> | undefined;
//       try {
//         if (rawHeaders) {
//           serializableHeaders = {};
//           for (const key of Object.keys(rawHeaders as Record<string, unknown>)) {
//             const val = (rawHeaders as Record<string, unknown>)[key];
//             serializableHeaders[key] = typeof val === "string" ? val : JSON.stringify(val);
//           }
//         }
//       } catch {
//         serializableHeaders = undefined;
//       }

//       const requestInfo = lastRequestConfig
//         ? {
//             url: lastRequestConfig.url,
//             method: String(lastRequestConfig.method || "GET"),
//             params: lastRequestConfig.params ?? null,
//             data: lastRequestConfig.data ?? null,
//             headers: lastRequestConfig.headers ?? null,
//           }
//         : { url };

//       const responseDataUnknown: unknown = err.response?.data;
//       const responseMessage =
//         typeof responseDataUnknown === "object" && responseDataUnknown !== null && "message" in (responseDataUnknown as Record<string, unknown>)
//           ? String((responseDataUnknown as Record<string, unknown>)["message"])
//           : undefined;

//       const errorPayload = {
//         status: err.response?.status ?? null,
//         statusText: err.response?.statusText ?? null,
//         code: err.code ?? null,
//         message: responseMessage ?? err.message,
//         data: responseDataUnknown ?? null,
//         headers: serializableHeaders ?? null,
//         request: requestInfo,
//         timestamp: new Date().toISOString(),
//       } as const;

//       return {
//         error: {
//           status: errorPayload.status,
//           data: errorPayload,
//         },
//       };
//     }
//   };

// export default axiosBaseQuery;