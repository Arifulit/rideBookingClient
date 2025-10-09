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
    try {
      console.log("🌐 === AXIOS REQUEST ===");
      console.log("🌐 axiosBaseQuery - Request URL:", url);
      console.log("🌐 axiosBaseQuery - Method:", method);
      console.log(
        "🌐 axiosBaseQuery - Data:",
        data ? JSON.stringify(data, null, 2) : "No data"
      );
      console.log("🌐 axiosBaseQuery - Params:", params);
      console.log("🌐 axiosBaseQuery - Headers:", headers);

      const result = await axiosInstance({
        url: url,
        method,
        data,
        params,
        headers,
      });

      console.log("✅ === AXIOS RESPONSE SUCCESS ===");
      console.log("✅ axiosBaseQuery - Response Status:", result.status);
      console.log(
        "✅ axiosBaseQuery - Response Data:",
        JSON.stringify(result.data, null, 2)
      );

      // Special token logging for auth endpoints
      if (url?.includes("/auth/") && result.data?.data?.tokens) {
        console.log("🎫 === AXIOS AUTH TOKEN DETECTION ===");
        console.log(
          "🎯 Detected Access Token:",
          result.data.data.tokens.accessToken
        );
        console.log(
          "🔄 Detected Refresh Token:",
          result.data.data.tokens.refreshToken
        );
        console.log("🎫 === END AUTH TOKEN DETECTION ===");
      }

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      console.log("❌ === AXIOS ERROR ===");
      console.log("❌ axiosBaseQuery - Error Status:", err.response?.status);
      console.log(
        "❌ axiosBaseQuery - Error Data:",
        JSON.stringify(err.response?.data, null, 2)
      );
      console.log("❌ axiosBaseQuery - Error Message:", err.message);
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

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export default axiosBaseQuery;
