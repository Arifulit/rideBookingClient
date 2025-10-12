/* eslint-disable @typescript-eslint/no-explicit-any */

import { baseApi } from "@/redux/baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params: any) => ({
        url: '/users',
        method: 'GET',
        params,
      }),
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        data: { status }, // axios uses data instead of body
      }),
      invalidatesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        data, // axios uses data instead of body
      }),
      invalidatesTags: ['User'],
    }),
    // Update the currently authenticated user's profile
    updateMyProfile: builder.mutation({
      query: (data: any) => ({
        url: `/users/profile`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['User'],
    }),
    // Get currently authenticated user's profile
    getProfile: builder.query({
      query: () => ({
        url: '/users/profile',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        // Normalize backend shapes: sometimes API returns { success, data: { user } } or returns user directly
        if (!response) return null;
        if (response.data) return response.data;
        return response;
      },
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useUpdateProfileMutation,
} = usersApi;

// Export the profile hook for convenience
export const { useGetProfileQuery } = usersApi;

// export the new mutation hook
export const { useUpdateMyProfileMutation } = usersApi;