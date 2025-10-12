import { baseApi } from "../../baseApi";
import { User, IVerifyOtp, AuthTokens } from "@/types";
import { IResponse, ISendOtp } from "@/types";

// API Response interfaces for better type safety
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface AuthData {
  user: User;
  tokens: AuthTokens;
  requiresVerification?: boolean;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/login",
        method: "POST",
        data: userInfo,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response: ApiResponse<AuthData>) => {
        console.log("🔄 AuthAPI (login): Raw backend response:", response);
        
        // Backend returns { success, message, data: { user, tokens } }
        const actualData = response.data as AuthData;
        const transformedResponse = {
          user: actualData.user,
          tokens: actualData.tokens,
          message: response.message || "Login successful"
        };
        
        console.log("🔄 AuthAPI (login): Transformed response:", transformedResponse);
        
        // Store authentication tokens securely
        if (transformedResponse.tokens?.accessToken) {
          console.log(" ===== LOGIN TOKEN LOCALSTORAGE STORAGE =====");
          console.log("� AuthAPI (login): Storing tokens to localStorage");
          console.log("🎫 Complete Token Object Being Stored:", transformedResponse.tokens);
          console.log("🎯 AccessToken FULL VALUE:", transformedResponse.tokens.accessToken);
          console.log("🔄 RefreshToken FULL VALUE:", transformedResponse.tokens.refreshToken || 'Not provided');
          console.log("⏰ ExpiresIn:", transformedResponse.tokens.expiresIn || 3600);
          console.log("🏷️ TokenType:", transformedResponse.tokens.tokenType || 'Bearer');
          console.log("📏 Access Token Character Count:", transformedResponse.tokens.accessToken?.length);
          
          localStorage.setItem('accessToken', transformedResponse.tokens.accessToken);
          localStorage.setItem('refreshToken', transformedResponse.tokens.refreshToken || '');
          
          // Verify storage with full token display
          const storedAccessToken = localStorage.getItem('accessToken');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          
          console.log("✅ Verification - FULL AccessToken from localStorage:", storedAccessToken);
          console.log("✅ Verification - FULL RefreshToken from localStorage:", storedRefreshToken);
          console.log("✅ AuthAPI (login): Tokens stored successfully to localStorage");
          console.log("💾 ===== END LOGIN TOKEN STORAGE =====");
        } else {
          console.warn("⚠️ AuthAPI (login): No tokens found in response");
        }
        
        return transformedResponse;
      },
    }),

    register: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/register",
        method: "POST",
        data: userInfo,
      }),
      transformResponse: (response: ApiResponse<AuthData>) => {
        console.log("🔄 ===== REGISTRATION API RESPONSE =====");
        console.log("🔄 AuthAPI (register): Raw backend response:", response);
        console.log("📊 Response Structure Analysis:");
        console.log("  ✓ Success:", response.success);
        console.log("  ✓ Message:", response.message);
        console.log("  ✓ Data Present:", !!response.data);
        console.log("  ✓ Data Keys:", response.data ? Object.keys(response.data) : []);
        
        // Handle both success and verification-required cases
        if (response.success && response.data) {
          const actualData = response.data as AuthData;
          
          console.log("📦 Registration Data Analysis:");
          console.log("  👤 User Present:", !!actualData.user);
          console.log("  🔑 Tokens Present:", !!actualData.tokens);
          console.log("  📧 Requires Verification:", !!actualData.requiresVerification);
          
          // Additional detailed logging
          if (actualData.user) {
            console.log("  📄 User Object Keys:", Object.keys(actualData.user));
          }
          if (actualData.tokens) {
            console.log("  🔑 Tokens Object Keys:", Object.keys(actualData.tokens));
          }
          
          if (actualData.user) {
            console.log("  👤 User Details:", {
              id: actualData.user.id,
              name: `${actualData.user.firstName} ${actualData.user.lastName}`,
              email: actualData.user.email,
              role: actualData.user.role
            });
          }
          
          if (actualData.tokens) {
            console.log("  🔑 === AUTHAPI TOKEN DETAILS ===");
            console.log("  🎯 Access Token FULL:", actualData.tokens.accessToken);
            console.log("  🔄 Refresh Token FULL:", actualData.tokens.refreshToken);
            console.log("  ⏰ Expires In:", actualData.tokens.expiresIn);
            console.log("  🏷️ Token Type:", actualData.tokens.tokenType);
            console.log("  📏 Access Token Length:", actualData.tokens.accessToken?.length);
            console.log("  📏 Refresh Token Length:", actualData.tokens.refreshToken?.length);
            console.log("  🔑 === END AUTHAPI TOKEN DETAILS ===");
          }
          
          const transformedResponse = {
            user: actualData.user,
            tokens: actualData.tokens,
            message: response.message || "Registration successful",
            requiresVerification: actualData.requiresVerification || false
          };
          
          console.log("🔄 AuthAPI (register): Transformed response:", transformedResponse);
          
          // Store tokens if registration is successful and returns tokens
          if (transformedResponse.tokens?.accessToken) {
            console.log("� === LOCALSTORAGE TOKEN STORAGE ===");
            console.log("�🔄 AuthAPI (register): Storing tokens to localStorage");
            console.log("🎯 Storing Access Token:", transformedResponse.tokens.accessToken);
            console.log("🔄 Storing Refresh Token:", transformedResponse.tokens.refreshToken || 'NONE');
            
            localStorage.setItem('accessToken', transformedResponse.tokens.accessToken);
            localStorage.setItem('refreshToken', transformedResponse.tokens.refreshToken || '');
            
            // Verify storage
            console.log("✅ Verification - Stored Access Token:", localStorage.getItem('accessToken'));
            console.log("✅ Verification - Stored Refresh Token:", localStorage.getItem('refreshToken'));
            console.log("💾 === END LOCALSTORAGE STORAGE ===");
          } else {
            console.log("ℹ️ AuthAPI (register): No tokens provided - verification required");
          }
          
          console.log("🔄 ===== END REGISTRATION API RESPONSE =====");
          return transformedResponse;
        } else {
          // Handle error cases
          console.error("❌ Registration failed:", response);
          console.log("🔄 ===== END REGISTRATION API RESPONSE =====");
          throw new Error(response.message || "Registration failed");
        }
      },
    }),

    userInfo: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getCurrentUser: builder.query<{ user: User }, void>({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Use only /otp/send endpoint as requested
    sendOtp: builder.mutation<IResponse<null>, ISendOtp>({
      query: (userInfo) => ({
        url: "/otp/send",
        method: "POST",
        data: userInfo,
      }),
      transformResponse: (response: IResponse<null>) => {
        console.log("🔄 AuthAPI (sendOtp): OTP send response:", response);
        return response;
      },
    }),

    verifyOtp: builder.mutation<IResponse<null>, IVerifyOtp>({
      query: (userInfo) => ({
        url: "/otp/verify",
        method: "POST",
        data: userInfo,
      }),
      transformResponse: (response: IResponse<null>) => {
        console.log("🔄 AuthAPI (verifyOtp): OTP verification response:", response);
        return response;
      },
    }),

    verifyToken: builder.query<{ user: User }, void>({
      query: () => ({
        url: "/auth/verify",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useUserInfoQuery,
  useVerifyTokenQuery,
  useGetCurrentUserQuery,
} = authApi;
