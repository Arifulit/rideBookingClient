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
      // Ensure defaults so callers that pass only a URL string still work and
      // so our logs always show a resolved HTTP method and headers.
      const resolvedMethod = (method || "GET") as AxiosRequestConfig["method"];
      const resolvedHeaders = headers || {};

      // If Authorization header is not provided, try to recover it from localStorage
      const providedHeaders = { ...(resolvedHeaders as Record<string, unknown>) };
      // If caller provided an Authorization header, normalize it (strip leading 'Bearer ' if present)
      try {
        const authKey = providedHeaders['Authorization'] ? 'Authorization' : (providedHeaders['authorization'] ? 'authorization' : null);
        if (authKey) {
          const rawVal = String(providedHeaders[authKey] ?? '').replace(/^Bearer\s+/i, '');
          providedHeaders[authKey] = rawVal;
          const masked = `${rawVal.slice(0, 20)}...`;
          console.log('🌐 axiosBaseQuery - Normalized provided Authorization header (masked):', masked);
        }
      } catch {
        // ignore normalization errors
      }

      if (!providedHeaders['Authorization'] && !providedHeaders['authorization']) {
        // Try common keys used in this project
        const lsToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const lsTokensJson = localStorage.getItem('tokens');
        let recovered: string | null = null;
        try {
          if (lsTokensJson) {
            const parsed = JSON.parse(lsTokensJson);
            recovered = parsed?.accessToken || null;
          }
        } catch {
          // ignore parse errors
        }

        const tokenToUse = recovered || lsToken || null;
        if (tokenToUse) {
          // Backend expects raw token without 'Bearer ' prefix. Strip if present and send raw token.
          const tokenClean = String(tokenToUse).replace(/^Bearer\s+/i, '');
          providedHeaders['Authorization'] = tokenClean;
          // Log only masked token to avoid accidentally printing full secrets in some environments
          const masked = `${String(tokenClean).slice(0, 20)}...`;
          console.log('🌐 axiosBaseQuery - Recovered Authorization (masked):', masked);
        } else {
          console.log('🌐 axiosBaseQuery - No Authorization found in provided headers or localStorage');
        }
      }

      const requestConfig: AxiosRequestConfig = {
        url,
        method: resolvedMethod,
        data,
        params,
        headers: providedHeaders as AxiosRequestConfig['headers'],
      };
      // capture the final config so the catch block can include it in the returned error
      lastRequestConfig = requestConfig;

      console.log("🌐 === AXIOS REQUEST ===");
      console.log("🌐 axiosBaseQuery - Request URL:", url);
      console.log("🌐 axiosBaseQuery - Resolved Method:", resolvedMethod);
      console.log(
        "🌐 axiosBaseQuery - Data:",
        data ? JSON.stringify(data, null, 2) : "No data"
      );
      console.log("🌐 axiosBaseQuery - Params:", params || "No params");
      console.log("🌐 axiosBaseQuery - Resolved Headers:", resolvedHeaders);
      // Also log whether an Authorization header is present (from caller or interceptor)
      try {
        const headersMap = resolvedHeaders as Record<string, unknown>;
          const authHeader = headersMap && (headersMap['Authorization'] || headersMap['authorization']);
          console.log("🌐 axiosBaseQuery - Authorization present (in provided headers):", !!authHeader);
      } catch {
        // ignore
      }

      const result = await axiosInstance(requestConfig);

      console.log("✅ === AXIOS RESPONSE SUCCESS ===");
      console.log("✅ axiosBaseQuery - Response Status:", result.status);
      console.log(
        "✅ axiosBaseQuery - Response Data:",
        JSON.stringify(result.data, null, 2)
      );
      // Additional helpful debugging info
      try {
        console.log("✅ axiosBaseQuery - Response Headers:", result.headers);
        console.log("✅ axiosBaseQuery - Full Response:", result);
      } catch {
        console.log("✅ axiosBaseQuery - Could not stringify full response");
      }

      // Special token logging for auth endpoints (handle both shapes)
      const tokensDetected = result.data?.data?.tokens || result.data?.tokens;
      if (url?.includes("/auth/") && tokensDetected) {
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
      // If the driver ride history endpoint is missing on the backend, return a safe empty shape
      // so the UI can render an empty list instead of crashing.
      if (
        err.response?.status === 404 &&
        url?.includes("/drivers/rides/history")
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

      // Serialize headers into a plain object to avoid non-serializable values
      const rawHeaders = err.response?.headers;
      let serializableHeaders: Record<string, string> | undefined;
      try {
        if (rawHeaders) {
          serializableHeaders = {};
          // Some axios versions expose headers as plain object, others use AxiosHeaders
          for (const key of Object.keys(rawHeaders as Record<string, unknown>)) {
            const val = (rawHeaders as Record<string, unknown>)[key];
            serializableHeaders[key] = typeof val === 'string' ? val : JSON.stringify(val);
          }
        }
      } catch {
        // Fallback - skip headers if serialization fails
        serializableHeaders = undefined;
      }

      // Build a detailed, serializable error payload
      const requestInfo = lastRequestConfig
        ? {
            url: lastRequestConfig.url,
            method: String(lastRequestConfig.method || 'GET'),
            params: lastRequestConfig.params ?? null,
            data: lastRequestConfig.data ?? null,
            headers: lastRequestConfig.headers ?? null,
          }
        : { url };

      const responseDataUnknown: unknown = err.response?.data;
      const responseMessage =
        typeof responseDataUnknown === 'object' && responseDataUnknown !== null && 'message' in (responseDataUnknown as Record<string, unknown>)
          ? String((responseDataUnknown as Record<string, unknown>)['message'])
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

      // Log the structured payload for developer debugging
      try {
        console.error('❌ axiosBaseQuery - Structured Error Payload:', JSON.stringify(errorPayload, null, 2));
      } catch {
        console.error('❌ axiosBaseQuery - Error Payload (unserializable) - falling back to printing pieces');
        console.error('status:', errorPayload.status, 'message:', errorPayload.message);
      }

      // Return a serializable error object compatible with RTK Query
      return {
        error: {
          status: errorPayload.status,
          data: errorPayload,
        },
      };
    }
  };

export default axiosBaseQuery;
