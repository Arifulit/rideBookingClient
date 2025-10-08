import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/redux/axiosBaseQuery';
import type { 
  Ride, 
  RideRequest, 
  RideHistory, 
  FareEstimation, 
  PaymentMethod, 
  RiderProfile, 
  LiveRideTracking,
  RideSearchParams,
  Location
} from '@/types/rider';

export const riderApi = createApi({
  reducerPath: 'riderApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'RideRequest', 
    'RideHistory', 
    'LiveRide', 
    'PaymentMethod', 
    'RiderProfile',
    'Location',
    'Ride',
    'Profile'
  ],
  endpoints: (builder) => ({
    // Location Services
    searchLocations: builder.query<Location[], { query: string }>({
      query: ({ query }) => ({
        url: '/rider/locations/search',
        method: 'GET',
        params: { q: query }
      }),
      providesTags: ['Location'],
    }),
    // Ride Request
    createRideRequest: builder.mutation<Ride, RideRequest>({
      query: (rideData) => ({
        url: '/rides',
        method: 'POST',
        data: rideData,
      }),
      invalidatesTags: ['RideRequest'],
    }),

    // Get Ride Details
    getRideDetails: builder.query<Ride, string>({
      query: (rideId) => ({
        url: `/rides/${rideId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, rideId) => [
        { type: 'Ride', id: rideId },
        'Ride'
      ],
    }),

    // Get Fare Estimation
    getFareEstimation: builder.query<FareEstimation[], {
      pickup: Location;
      destination: Location;
      rideTypes?: string[];
    }>({
      query: ({ pickup, destination, rideTypes = ['economy', 'premium', 'luxury'] }) => ({
        url: '/rides/estimate-fare',
        method: 'POST',
        data: {
          pickupLocation: pickup,
          destinationLocation: destination,
          rideTypes,
        },
      }),
    }),

    // Get Ride History
    getRideHistory: builder.query<RideHistory, RideSearchParams>({
      query: (params) => ({
        url: '/rides/history',
        method: 'GET',
        params,
      }),
      providesTags: ['Ride'],
    }),

    // Cancel Ride Request
    cancelRideRequest: builder.mutation<Ride, { rideId: string; reason?: string }>({
      query: ({ rideId, reason }) => ({
        url: `/rides/${rideId}/cancel`,
        method: 'PATCH',
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { rideId }) => [{ type: 'Ride', id: rideId }],
    }),

    // Rate Driver
    rateDriver: builder.mutation<Ride, { 
      rideId: string; 
      driverId: string;
      rating: number; 
      comment?: string 
    }>({
      query: ({ rideId, driverId, rating, comment }) => ({
        url: `/rides/${rideId}/rate-driver`,
        method: 'PATCH',
        data: { driverId, rating, comment },
      }),
      invalidatesTags: (_result, _error, { rideId }) => [{ type: 'Ride', id: rideId }],
    }),

    // Live Ride Tracking
    getLiveRideTracking: builder.query<LiveRideTracking, string>({
      query: (rideId) => ({
        url: `/rides/${rideId}/tracking`,
        method: 'GET',
      }),
    }),

    // Profile Management
    getRiderProfile: builder.query<RiderProfile, void>({
      query: () => ({
        url: '/rider/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    updateRiderProfile: builder.mutation<RiderProfile, Partial<RiderProfile>>({
      query: (profileData) => ({
        url: '/rider/profile',
        method: 'PUT',
        data: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),

    changePassword: builder.mutation<{ message: string }, {
      currentPassword: string;
      newPassword: string;
    }>({
      query: (passwordData) => ({
        url: '/rider/change-password',
        method: 'POST',
        data: passwordData,
      }),
    }),

    uploadProfileImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: '/rider/profile/upload-image',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: ['Profile'],
    }),

    // Payment Methods
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => ({
        url: '/rider/payment-methods',
        method: 'GET',
      }),
      providesTags: ['PaymentMethod'],
    }),

    addPaymentMethod: builder.mutation<PaymentMethod, Omit<PaymentMethod, 'id'>>({
      query: (paymentMethod) => ({
        url: '/rider/payment-methods',
        method: 'POST',
        data: paymentMethod,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    removePaymentMethod: builder.mutation<void, string>({
      query: (paymentMethodId) => ({
        url: `/rider/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    setDefaultPaymentMethod: builder.mutation<PaymentMethod, string>({
      query: (paymentMethodId) => ({
        url: `/rider/payment-methods/${paymentMethodId}/set-default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // Location Services
    searchPlaces: builder.query<Location[], string>({
      query: (searchQuery) => ({
        url: '/places/search',
        method: 'GET',
        params: { q: searchQuery },
      }),
    }),

    getCurrentLocation: builder.query<Location, void>({
      queryFn: async () => {
        try {
          return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation is not supported'));
              return;
            }

            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                  // Reverse geocoding to get address
                  const response = await fetch(
                    `/api/places/reverse-geocode?lat=${latitude}&lng=${longitude}`
                  );
                  const data = await response.json();
                  
                  resolve({
                    data: {
                      address: data.address || 'Current Location',
                      latitude,
                      longitude,
                      city: data.city,
                      state: data.state,
                      country: data.country,
                    }
                  });
                } catch {
                  resolve({
                    data: {
                      address: 'Current Location',
                      latitude,
                      longitude,
                    }
                  });
                }
              },
              (error) => {
                reject(new Error(error.message));
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
              }
            );
          });
        } catch (error) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            } 
          };
        }
      },
    }),
  }),
});

export const {
  // Location services
  useLazySearchLocationsQuery,
  
  // Ride requests
  useCreateRideRequestMutation,
  useGetFareEstimationQuery,
  useLazyGetFareEstimationQuery,

  // Ride management
  useGetRideHistoryQuery,
  useGetRideDetailsQuery,
  useCancelRideRequestMutation,
  useRateDriverMutation,

  // Live tracking
  useGetLiveRideTrackingQuery,

  // Profile
  useGetRiderProfileQuery,
  useUpdateRiderProfileMutation,
  useChangePasswordMutation,
  useUploadProfileImageMutation,

  // Payment methods
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useRemovePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,

  // Additional location services
  useSearchPlacesQuery,
  useLazySearchPlacesQuery,
  useGetCurrentLocationQuery,
  useLazyGetCurrentLocationQuery,
} = riderApi;