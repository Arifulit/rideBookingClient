
// import { baseApi } from "@/redux/baseApi";
// import type { Ride } from "@/types";

// export const ridesApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     createRide: builder.mutation<Ride, { pickup: string; destination: string; fare: number }>({
//       query: (rideData) => ({
//         url: '/rides/request',
//         method: 'POST',
//         data: rideData, 
//       }),
//       invalidatesTags: ['Ride'],
//     }),

//     getRides: builder.query<
//       {
//         rides: Ride[];
//         total: number;
//         thisMonth: number;
//         averageRating: number;
//         totalSpent: number;
//       },
//       { limit?: number }
//     >({
//       query: (params = {}) => ({
//         url: '/ride',
//         method: 'GET',
//         params,
//       }),
//       providesTags: ['Ride'],
//     }),

//     getRideById: builder.query<Ride, string>({
//       query: (id) => ({
//         url: `/ride/${id}`,
//         method: 'GET',
//       }),
//       providesTags: ['Ride'],
//     }),

//     updateRideStatus: builder.mutation<Ride, { id: string; status: string }>({
//       query: ({ id, status }) => ({
//         url: `/ride/${id}/status`,
//         method: 'PATCH',
//         data: { status },
//       }),
//       invalidatesTags: ['Ride'],
//     }),

//     acceptRide: builder.mutation<Ride, string>({
//       query: (id) => ({
//         url: `/ride/${id}/accept`,
//         method: 'PATCH',
//       }),
//       invalidatesTags: ['Ride'],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useCreateRideMutation,
//   useGetRidesQuery,
//   useGetRideByIdQuery,
//   useUpdateRideStatusMutation,
//   useAcceptRideMutation,
// } = ridesApi;