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
  ChartData,
} from '@/types/admin';

export interface AdminAnalytics {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  totalEarnings: number;
  totalUsers: number;
  totalDrivers: number;
}

export interface ReportOverview {
  overview: {
    totalUsers: number;
    totalRiders: number;
    totalDrivers: number;
    totalRides: number;
    activeRides: number;
    onlineDrivers: number;
    pendingDriverApprovals: number;
  };
  recentActivity: any[];
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.baseURL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const tokens = (state.auth as any)?.tokens;
      if (tokens?.accessToken) {
        const clean = String(tokens.accessToken).replace(/^Bearer\s+/i, '');
        headers.set('Authorization', clean);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Driver', 'Ride', 'Analytics', 'Admin', 'Settings'],
  endpoints: (builder) => ({

    /* DASHBOARD & ANALYTICS */
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/admin/rides/statistics',
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    getReportsOverview: builder.query<ReportOverview, void>({
      query: () => ({ url: '/admin/reports/overview', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: ['Analytics'],
    }),

    getRideVolumeChart: builder.query<ChartData[], AnalyticsParams>({
      query: ({ period = 'month', startDate, endDate } = {}) => {
        const p = new URLSearchParams({ period });
        if (startDate) p.append('startDate', startDate);
        if (endDate) p.append('endDate', endDate);
        return `/admin/analytics/ride-volume?${p.toString()}`;
      },
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    getRevenueChart: builder.query<ChartData[], AnalyticsParams>({
      query: ({ period = 'month', startDate, endDate } = {}) => {
        const p = new URLSearchParams({ period });
        if (startDate) p.append('startDate', startDate);
        if (endDate) p.append('endDate', endDate);
        return `/admin/analytics/revenue?${p.toString()}`;
      },
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    getDriverActivityChart: builder.query<DriverActivityData[], void>({
      query: () => '/admin/analytics/driver-activity',
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    getUserGrowthChart: builder.query<ChartData[], AnalyticsParams>({
      query: ({ period = 'month' } = {}) => `/admin/analytics/user-growth?period=${period}`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    /* USER MANAGEMENT */
    getUsers: builder.query<PaginatedResponse<User>, UserSearchParams>({
      query: (params = {}) => {
        const p = new URLSearchParams();
        if (params.search) p.append('search', params.search);
        if (params.role && params.role !== 'all') p.append('role', params.role);
        if (params.status && params.status !== 'all') p.append('status', params.status);
        if (params.page) p.append('page', params.page.toString());
        if (params.limit) p.append('limit', params.limit.toString());
        if (params.sortBy) p.append('sortBy', params.sortBy);
        if (params.sortOrder) p.append('sortOrder', params.sortOrder);
        return `/admin/users?${p.toString()}`;
      },
      transformResponse: (res: any) => {
        const transformUser = (u: any) => ({
          ...u,
          id: u.id ?? u._id,
          name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.name ?? 'Unknown User',
          status: u.isBlocked ? 'blocked' : (u.isActive ? 'active' : 'inactive'),
          phone: u.phone ?? u.phoneNumber ?? u.contactNumber ?? 'N/A',
          profileImage: u.profilePicture ?? u.profileImage ?? u.avatar,
        });

        if (res?.success && res?.data) {
          const users = (res.data.users ?? res.data ?? []).map(transformUser);
          return {
            data: users,
            pagination: res.data.pagination ?? { total: users.length, page: 1, limit: 10 },
            total: res.data.total ?? users.length,
          };
        }

        if (Array.isArray(res)) {
          const users = res.map(transformUser);
          return {
            data: users,
            pagination: { total: users.length, page: 1, limit: users.length },
            total: users.length,
          };
        }

        return { data: [], pagination: { total: 0, page: 1, limit: 10 }, total: 0 };
      },
      providesTags: ['User'],
    }),

    getUserDetails: builder.query<User, string>({
      query: (userId) => `/admin/users/${userId}`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['User'],
    }),

    blockUser: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/block`,
        method: 'PATCH',
        body: { isBlocked: true, reason: reason ?? 'Admin action' },
      }),
      invalidatesTags: ['User'],
    }),

    unblockUser: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/unblock`,
        method: 'PATCH',
        body: { isBlocked: false, reason: reason ?? 'Admin unblock action' },
      }),
      invalidatesTags: ['User'],
    }),

    updateUserStatus: builder.mutation<ApiResponse, { userId: string; isActive: string; reason?: string }>({
      query: ({ userId, isActive, reason }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { isActive, reason: reason ?? 'Admin status update' },
      }),
      invalidatesTags: ['User'],
    }),

    /* DRIVER MANAGEMENT */
    suspendDriver: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId: driverId, reason }) => ({
        url: `/admin/drivers/${driverId}/suspend`,
        method: 'PATCH',
        body: { isActive: 'suspended', reason: reason ?? 'Admin suspend action' },
      }),
      invalidatesTags: ['Driver', 'User'],
    }),

    approveDriver: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId: driverId, reason }) => ({
        url: `/admin/drivers/${driverId}/approve`,
        method: 'PATCH',
        body: { isActive: 'active', reason: reason ?? 'Admin approval action' },
      }),
      invalidatesTags: ['Driver', 'User'],
    }),

    rejectDriver: builder.mutation<ApiResponse, UserActionRequest>({
      query: ({ userId: driverId, reason }) => ({
        url: `/admin/drivers/${driverId}/reject`,
        method: 'PATCH',
        body: { isActive: 'rejected', reason: reason ?? 'Admin reject action' },
      }),
      invalidatesTags: ['Driver', 'User'],
    }),

    /* RIDE MANAGEMENT */
    getAdminRides: builder.query<PaginatedResponse<AdminRideOverview>, RideSearchParams>({
      query: (params = {}) => {
        const p = new URLSearchParams();
        if (params.status) p.append('status', params.status);
        if (params.search) p.append('search', params.search);
        if (params.driverId) p.append('driverId', params.driverId);
        if (params.riderId) p.append('riderId', params.riderId);
        if (params.startDate) p.append('startDate', params.startDate);
        if (params.endDate) p.append('endDate', params.endDate);
        if (params.page) p.append('page', params.page.toString());
        if (params.limit) p.append('limit', params.limit.toString());
        return `/admin/rides?${p.toString()}`;
      },
      transformResponse: (res: any) => {
        if (res?.success && res?.data) {
          return {
            data: res.data.rides ?? res.data,
            pagination: res.data.pagination ?? { total: 0, page: 1, limit: 10 },
            total: res.data.total ?? 0,
          };
        }
        return res?.data ?? res ?? { data: [], pagination: { total: 0, page: 1, limit: 10 }, total: 0 };
      },
      providesTags: ['Ride'],
    }),

    getAdminRideDetails: builder.query<AdminRideOverview, string>({
      query: (rideId) => `/admin/rides/${rideId}`,
      transformResponse: (res: any) => res.data ?? res,
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

    /* ADMIN PROFILE */
    getAdminProfile: builder.query<AdminUser, void>({
      query: () => '/admin/profile',
      transformResponse: (res: any) => res?.data?.admin ?? res?.data ?? res,
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
      query: (payload) => ({
        url: '/admin/change-password',
        method: 'POST',
        body: payload,
      }),
    }),

    uploadAdminProfileImage: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: '/admin/profile/image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Admin'],
    }),

    /* SEARCH & EXPORT */
    searchGlobal: builder.query<any, { query: string; type?: string }>({
      query: ({ query, type }) => {
        const p = new URLSearchParams({ q: query });
        if (type) p.append('type', type);
        return `/admin/search?${p.toString()}`;
      },
      transformResponse: (res: any) => res.data ?? res,
    }),

    exportUsers: builder.mutation<Blob, { format?: 'csv' | 'excel'; filters?: any }>({
      query: ({ format = 'csv', filters = {} }) => {
        const p = new URLSearchParams({ format });
        Object.entries(filters).forEach(([k, v]) => v && p.append(k, String(v)));
        return {
          url: `/admin/export/users?${p.toString()}`,
          method: 'GET',
          responseHandler: (r) => r.blob(),
        };
      },
    }),

    exportRides: builder.mutation<Blob, { format?: 'csv' | 'excel'; filters?: any }>({
      query: ({ format = 'csv', filters = {} }) => {
        const p = new URLSearchParams({ format });
        Object.entries(filters).forEach(([k, v]) => v && p.append(k, String(v)));
        return {
          url: `/admin/export/rides?${p.toString()}`,
          method: 'GET',
          responseHandler: (r) => r.blob(),
        };
      },
    }),

    /* SYSTEM SETTINGS */
    getSystemSettings: builder.query<any, void>({
      query: () => '/admin/settings',
      transformResponse: (res: any) => res.data ?? res,
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

    /* ADDITIONAL ANALYTICS */
    getRevenueAnalytics: builder.query<ChartData[], { period?: string }>({
      query: ({ period = 'month' } = {}) => `/admin/analytics/earnings?period=${period}`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    getRideStats: builder.query<any, { period?: string }>({
      query: ({ period = 'month' } = {}) => `/admin/rides/stats?period=${period}`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    getDriverAnalytics: builder.query<DriverActivityData[], void>({
      query: () => '/admin/analytics/drivers',
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Analytics'],
    }),

    getStatusDistribution: builder.query<{ name: string; value: number }[], AnalyticsParams | void>({
      query: ({ period = 'month', startDate, endDate } = {}) => {
        const p = new URLSearchParams({ period });
        if (startDate) p.append('startDate', startDate);
        if (endDate) p.append('endDate', endDate);
        return `/admin/analytics/status-distribution?${p.toString()}`;
      },
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: ['Analytics'],
    }),

    /* DRIVERS / RIDERS */
    getAllDrivers: builder.query<any[], void>({
      query: () => '/admin/drivers',
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (result) =>
        result
          ? [...result.map((d: any) => ({ type: 'Driver' as const, id: d.id ?? d._id })), 'Driver']
          : ['Driver'],
    }),

    getAllRiders: builder.query<any[], void>({
      query: () => '/admin/riders',
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (result) =>
        result
          ? [...result.map((r: any) => ({ type: 'User' as const, id: r.id ?? r._id })), 'User']
          : ['User'],
    }),
      // new mutation: create report on server
    createReport: builder.mutation<ReportOverview, { type?: string; startDate?: string; endDate?: string } | void>({
      query: (body) => ({
        url: '/admin/reports/generate',
        method: 'POST',
        body: body ?? {},
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: ['Analytics'],
    }),

    /* ADMIN-SPECIFIC: Admin analytics endpoint requested */
    getAdminAnalytics: builder.query<AdminAnalytics, void>({
      query: () => ({ url: '/rides/admin/analytics', method: 'GET' }),
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: ['Analytics'],
    }),

     getDriverRideRequests: builder.query<any, { showAll?: boolean; page?: number; limit?: number; status?: string } | void>({
      query: (params = {}) => {
        const p = new URLSearchParams();
        if (params?.showAll) p.append('showAll', 'true');
        if (params?.page) p.append('page', String(params.page));
        if (params?.limit) p.append('limit', String(params.limit));
        if (params?.status) p.append('status', String(params.status));
        // backend path as provided
        const qs = p.toString();
        return `/driver/rides/requests${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (res: any) => {
        // normalize to array (res.data expected)
        if (res?.success && Array.isArray(res.data)) return res.data;
        if (Array.isArray(res)) return res;
        return res?.data ?? [];
      },
      providesTags: ['Ride'],
    }),

  }),
});

/* HOOK EXPORTS */
export const {
  useGetDashboardStatsQuery,
  useGetReportsOverviewQuery,
  useGetRideVolumeChartQuery,
  useGetRevenueChartQuery,
  useGetDriverActivityChartQuery,
  useGetUserGrowthChartQuery,
  useGetStatusDistributionQuery,
  useGetRevenueAnalyticsQuery,
  useGetRideStatsQuery,
  useGetDriverAnalyticsQuery,
  useGetAdminAnalyticsQuery,
   useCreateReportMutation,
  useGetDriverRideRequestsQuery,

  useGetUsersQuery,
  useGetUserDetailsQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useUpdateUserStatusMutation,

  useSuspendDriverMutation,
  useApproveDriverMutation,
  useRejectDriverMutation,
  useGetAllDriversQuery,
  useGetAllRidersQuery,

  useGetAdminRidesQuery,
  useGetAdminRideDetailsQuery,
  useUpdateRideStatusMutation,

  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
  useUploadAdminProfileImageMutation,

  useSearchGlobalQuery,
  useExportUsersMutation,
  useExportRidesMutation,

  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} = adminApi;