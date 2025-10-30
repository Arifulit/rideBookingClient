/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all users (with optional query params)
    getUsers: builder.query({
      query: (params: any) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    // ✅ Update a user's status
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        data: { status }, // axios uses 'data' instead of 'body'
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ Update any user profile (admin use)
    updateProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ Update the authenticated user's own profile
    updateMyProfile: builder.mutation({
      query: (data: any) => ({
        url: `/users/profile`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ Get the authenticated user's profile
    getProfile: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        // Handle different backend response formats
        if (!response) return null;
        if (response.data) return response.data;
        return response;
      },
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

// ✅ Export all hooks cleanly
export const {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useUpdateProfileMutation,
  useUpdateMyProfileMutation,
  useGetProfileQuery,
} = usersApi;
