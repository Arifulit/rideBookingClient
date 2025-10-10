/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';
import { config } from '@/config/env';
import type {
  AdminUser,
  User,
  AdminRideOverview,
  DashboardStats,
  DriverActivityData,
  UserSearchParams,
  RideSearchParams,
  AnalyticsParams,
  UserActionRequest,
  RideActionRequest,
  PaginatedResponse,
  ApiResponse,
  ChartData
} from '@/types/admin';



export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseURL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const tokens = state.auth && 'tokens' in state.auth ? (state.auth as any).tokens : undefined;
      if (tokens?.accessToken) {
        // Use standard Bearer token format and proper capitalization
        headers.set('Authorization', `Bearer ${tokens.accessToken}`);
        headers.set('content-type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Driver', 'Ride', 'Analytics', 'Admin', 'Settings'],
  endpoints: (builder) => ({

    // ✅ DASHBOARD & ANALYTICS
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/admin/dashboard/stats',
      transformResponse: (response: any) => {
        console.log('📊 Backend Dashboard Stats:', response);
        return response.data || response;
      },
      providesTags: ['Analytics'],
    }),

    getRideVolumeChart: builder.query<ChartData[], AnalyticsParams>({
      query: ({ period = 'month', startDate, endDate } = {}) => {
        const params = new URLSearchParams({ period });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/admin/analytics/ride-volume?${params.toString()}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Analytics'],
    }),

    getRevenueChart: builder.query<ChartData[], AnalyticsParams>({
      query: ({ period = 'month', startDate, endDate } = {}) => {
        const params = new URLSearchParams({ period });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/admin/analytics/revenue?${params.toString()}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Analytics'],
    }),

    getDriverActivityChart: builder.query<DriverActivityData[], void>({
      query: () => '/admin/analytics/driver-activity',
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Analytics'],
    }),

    getUserGrowthChart: builder.query<ChartData[], AnalyticsParams>({
      query: ({ period = 'month' } = {}) => `/admin/analytics/user-growth?period=${period}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Analytics'],
    }),

    // ✅ USER MANAGEMENT - FIXED Backend Routes
    getUsers: builder.query<PaginatedResponse<User>, UserSearchParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.search) queryParams.append('search', params.search);
        if (params.role && params.role !== 'all') queryParams.append('role', params.role);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        return `/admin/users?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        console.log('🔍 Backend Users Response:', response);
        
        // Transform users to match UI expectations
        const transformUser = (user: any) => ({
          ...user,
          // Combine firstName + lastName as name for display
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Unknown User',
          // Map isActive to status for compatibility
          status: user.isBlocked ? 'blocked' : user.isActive === 'active' ? 'active' : user.isActive || 'active',
          // Ensure phone is available
          phone: user.phone || user.phoneNumber || user.contactNumber || 'N/A',
          // Handle profile image
          profileImage: user.profilePicture || user.profileImage || user.avatar,
          // Use _id as id if needed
          id: user.id || user._id,
        });
        
        // ✅ Enhanced backend response handling
        if (response?.success && response?.data) {
          const users = (response.data.users || response.data || []).map(transformUser);
          return {
            data: users,
            pagination: response.data.pagination || response.pagination || { 
              total: users.length, 
              page: 1, 
              limit: 10 
            },
            total: response.data.total || users.length
          };
        }
        
        // Direct array response
        if (Array.isArray(response)) {
          const users = response.map(transformUser);
          return {
            data: users,
            pagination: { total: users.length, page: 1, limit: users.length },
            total: users.length
          };
        }

        // MongoDB response format
        if (response?.users && Array.isArray(response.users)) {
          const users = response.users.map(transformUser);
          return {
            data: users,
            pagination: response.pagination || { total: users.length, page: 1, limit: users.length },
            total: response.total || users.length
          };
        }
        
        // Single user response (for testing)
        if (response && typeof response === 'object' && response.firstName) {
          const user = transformUser(response);
          return {
            data: [user],
            pagination: { total: 1, page: 1, limit: 1 },
            total: 1
          };
        }
        
        return {
          data: [],
          pagination: { total: 0, page: 1, limit: 10 },
          total: 0
        };
      },
      providesTags: ['User'],
    }),

    getUserDetails: builder.query<User, string>({
      query: (userId) => `/admin/users/${userId}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ['User'],
    }),

    blockUser: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/block`,
        method: 'PATCH',
        body: { 
          isBlocked: true,
          reason: reason || 'Admin action' 
        },
      }),
      transformResponse: (response: any) => {
        console.log('🚫 Block User Response:', response);
        return response;
      },
      invalidatesTags: ['User'],
    }),

    unblockUser: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/unblock`,
        method: 'PATCH', 
        body: { 
          isBlocked: false,
          reason: reason || 'Admin unblock action' 
        },
      }),
      transformResponse: (response: any) => {
        console.log('✅ Unblock User Response:', response);
        return response;
      },
      invalidatesTags: ['User'],
    }),

    suspendDriver: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId: driverId, reason }) => ({
        url: `/admin/users/${driverId}/suspend`,
        method: 'PATCH',
        body: { 
          isActive: 'suspended',
          reason: reason || 'Admin suspend action' 
        },
      }),
      transformResponse: (response: any) => {
        console.log('⏸️ Suspend Driver Response:', response);
        return response;
      },
      invalidatesTags: ['Driver', 'User'],
    }),

    approveDriver: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId: driverId, reason }) => ({
        url: `/admin/users/${driverId}/approve`,
        method: 'PATCH',
        body: { 
          isActive: 'active',
          reason: reason || 'Admin approval action' 
        },
      }),
      transformResponse: (response: any) => {
        console.log('✅ Approve Driver Response:', response);
        return response;
      },
      invalidatesTags: ['Driver', 'User'],
    }),

    updateUserStatus: builder.mutation<ApiResponse, { userId: string; isActive: string; reason?: string }>({
      query: ({ userId, isActive, reason }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { 
          isActive,
          reason: reason || 'Admin status update' 
        },
      }),
      transformResponse: (response: any) => {
        console.log('🔄 Update User Status Response:', response);
        return response;
      },
      invalidatesTags: ['User'],
    }),

    // ✅ RIDE MANAGEMENT - FIXED Routes
    getAdminRides: builder.query<PaginatedResponse<AdminRideOverview>, RideSearchParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.driverId) queryParams.append('driverId', params.driverId);
        if (params.riderId) queryParams.append('riderId', params.riderId);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        return `/admin/rides?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        console.log('🚗 Backend Admin Rides:', response);
        
        if (response?.success && response?.data) {
          return {
            data: response.data.rides || response.data,
            pagination: response.data.pagination || response.pagination || { 
              total: response.data.rides?.length || 0, 
              page: 1, 
              limit: 10 
            },
            total: response.data.total || response.data.rides?.length || 0
          };
        }

        return response.data || response;
      },
      providesTags: ['Ride'],
    }),

    getAdminRideDetails: builder.query<AdminRideOverview, string>({
      query: (rideId) => `/admin/rides/${rideId}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Ride'],
    }),

    updateRideStatus: builder.mutation<ApiResponse, RideActionRequest>({
      query: ({ rideId, status, reason }) => ({
        url: `/admin/rides/${rideId}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      invalidatesTags: ['Ride'],
    }),

    // ✅ ADMIN PROFILE
    getAdminProfile: builder.query<AdminUser, void>({
      query: () => '/admin/profile',
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Admin'],
    }),

    updateAdminProfile: builder.mutation<ApiResponse, Partial<AdminUser>>({
      query: (profileData) => ({
        url: '/admin/profile',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['Admin'],
    }),

    changeAdminPassword: builder.mutation<ApiResponse, { currentPassword: string; newPassword: string }>({
      query: (passwordData) => ({
        url: '/admin/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // ✅ FIXED: File upload with proper FormData handling
    uploadAdminProfileImage: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: '/admin/profile/image',
        method: 'POST',
        body: formData,
        formData: true, // RTK Query FormData flag
      }),
      invalidatesTags: ['Admin'],
    }),

    // ✅ SEARCH & EXPORT - FIXED
    searchGlobal: builder.query<any, { query: string; type?: string }>({
      query: ({ query, type }) => {
        const params = new URLSearchParams({ q: query });
        if (type) params.append('type', type);
        return `/admin/search?${params.toString()}`;
      },
      transformResponse: (response: any) => response.data || response,
    }),

    // ✅ FIXED: Export endpoints with proper blob handling
    exportUsers: builder.mutation<Blob, { format?: 'csv' | 'excel'; filters?: any }>({
      query: ({ format = 'csv', filters = {} }) => {
        const params = new URLSearchParams({ format });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
        return {
          url: `/admin/export/users?${params.toString()}`,
          method: 'GET',
          responseHandler: (response) => response.blob(), // Proper blob handling
        };
      },
    }),

    exportRides: builder.mutation<Blob, { format?: 'csv' | 'excel'; filters?: any }>({
      query: ({ format = 'csv', filters = {} }) => {
        const params = new URLSearchParams({ format });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
        return {
          url: `/admin/export/rides?${params.toString()}`,
          method: 'GET',
          responseHandler: (response) => response.blob(), // Proper blob handling
        };
      },
    }),

    // ✅ SYSTEM SETTINGS
    getSystemSettings: builder.query<any, void>({
      query: () => '/admin/settings',
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Settings'],
    }),

    updateSystemSettings: builder.mutation<ApiResponse, any>({
      query: (settings) => ({
        url: '/admin/settings',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),

    // ✅ ADDITIONAL ANALYTICS - FIXED
    getRevenueAnalytics: builder.query<ChartData[], { period?: string }>({
      query: ({ period = 'month' } = {}) => `/admin/analytics/earnings?period=${period}`,
      transformResponse: (response: any) => {
        console.log('💰 Backend Revenue Analytics:', response);
        return response.data || response;
      },
      providesTags: ['Analytics'],
    }),

    getRideStats: builder.query<any, { period?: string }>({
      query: ({ period = 'month' } = {}) => `/admin/rides/stats?period=${period}`,
      transformResponse: (response: any) => {
        console.log('🚗 Backend Ride Stats:', response);
        return response.data || response;
      },
      providesTags: ['Analytics'],
    }),

    getDriverAnalytics: builder.query<DriverActivityData[], void>({
      query: () => '/admin/analytics/drivers',
      transformResponse: (response: any) => {
        console.log('👨‍💼 Backend Driver Analytics:', response);
        return response.data || response;
      },
      providesTags: ['Analytics'],
    }),
    // ✅ STATUS DISTRIBUTION (used by Analytics page)
    getStatusDistribution: builder.query<{ name: string; value: number }[], AnalyticsParams | void>({
      query: ({ period = 'month', startDate, endDate } = {}) => {
        const params = new URLSearchParams({ period });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/admin/analytics/status-distribution?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        console.log('📈 Backend Status Distribution:', response);
        // Normalize response shapes: data or direct payload
        return response?.data || response;
      },
      providesTags: ['Analytics'],
    }),
  }),
});

// ✅ SINGLE EXPORT STATEMENT - All hooks exported here
export const {
  // Dashboard & Analytics
  useGetDashboardStatsQuery,
  useGetRideVolumeChartQuery,
  useGetRevenueChartQuery,
  useGetDriverActivityChartQuery,
  useGetStatusDistributionQuery,
  useGetUserGrowthChartQuery,
  useGetRevenueAnalyticsQuery,
  useGetRideStatsQuery,
  useGetDriverAnalyticsQuery,

  // User Management
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserStatusMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useSuspendDriverMutation,
  useApproveDriverMutation,

  // Ride Management
  useGetAdminRidesQuery,
  useGetAdminRideDetailsQuery,
  useUpdateRideStatusMutation,

  // Admin Profile
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
  useUploadAdminProfileImageMutation,

  // Search and Export
  useSearchGlobalQuery,
  useLazySearchGlobalQuery,
  useExportUsersMutation,
  useExportRidesMutation,

  // System Settings
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} = adminApi;