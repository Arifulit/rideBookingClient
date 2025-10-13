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

// Minimal driver shape returned by /ride/search-drivers
export type Driver = {
  id: string;
  name?: string;
  vehicle?: {
    make?: string;
    model?: string;
    plate?: string;
    type?: string;
  } | null;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  distanceMeters?: number;
  etaSeconds?: number;
  rating?: number;
};

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
    // Location Services - legacy alias kept for compatibility
    searchLocations: builder.query<Location[], { query: string } | string>({
      // Accept either a plain string or an object { query }
      query: (arg) => {
        const q = typeof arg === 'string' ? arg : (arg?.query ?? '');
        return {
          url: '/places/search',
          method: 'GET',
          params: { q },
        };
      },
      providesTags: ['Location'],
    }),
    // Ride Request
   createRideRequest: builder.mutation<Ride, RideRequest>({
      query: (rideData) => ({
        url: '/rides/request',
        method: 'POST',
        data: rideData,
      }),
      invalidatesTags: ['RideRequest'],
    }),

    // Get Ride Details
    getRideDetails: builder.query<Ride, string>({
      query: (rideId) => ({
        url: `/ride/${rideId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, rideId) => [
        { type: 'Ride', id: rideId },
        'Ride'
      ],
    }),

    // Get Fare Estimation (accepts pickupLocation, dropoffLocation, vehicleType)
    getFareEstimation: builder.mutation<FareEstimation, {
      pickupLocation: { latitude: number; longitude: number; address?: string };
      dropoffLocation: { latitude: number; longitude: number; address?: string };
      vehicleType?: string;
    }>({
      query: ({ pickupLocation, dropoffLocation, vehicleType = 'car' }) => ({
        url: '/ride/estimate',
        method: 'POST',
        data: {
          pickupLocation,
          dropoffLocation,
          vehicleType,
        },
      }),
    }),
      // Search for nearby drivers based on rider location and radius
      searchDrivers: builder.mutation<Driver[], { latitude: number; longitude: number; radius: number }>({
        query: (coords) => ({
          url: '/ride/search-drivers',
          method: 'POST',
          data: coords,
        }),
        // No cache invalidation required; this is an on-demand search
      }),

    // Get Ride History
    getRideHistory: builder.query<RideHistory, RideSearchParams>({
      query: (params) => ({
        url: '/ride/my-rides',
        method: 'GET',
        params,
      }),
      providesTags: ['Ride'],
    }),

    // Cancel Ride Request
    cancelRideRequest: builder.mutation<Ride, { rideId: string; reason?: string }>({
      query: ({ rideId, reason }) => ({
        url: `/ride/${rideId}/cancel`,
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
        url: `/ride/${rideId}/rate`,
        method: 'PATCH',
        data: { driverId, rating, comment },
      }),
      invalidatesTags: (_result, _error, { rideId }) => [{ type: 'Ride', id: rideId }],
    }),

    // Convenience mutation: accept { rideId, rating, feedback } from UI and map to server shape
    rateDriverSimple: builder.mutation<Ride, { rideId: string; rating: number; feedback?: string }>({
      query: ({ rideId, rating, feedback }) => ({
        url: `/ride/${rideId}/rate`,
        method: 'PATCH',
        data: { rating, comment: feedback },
      }),
      invalidatesTags: (_result, _error, { rideId }) => [{ type: 'Ride', id: rideId }],
    }),

    // Live Ride Tracking
    getLiveRideTracking: builder.query<LiveRideTracking, string>({
      query: (rideId) => ({
        url: `/ride/${rideId}/tracking`,
        method: 'GET',
      }),
    }),

    // Profile Management
    getRiderProfile: builder.query<RiderProfile, void>({
      query: () => ({
        url: '/users/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    updateRiderProfile: builder.mutation<RiderProfile, Partial<RiderProfile>>({
      // Backend expects PATCH for partial profile updates
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PATCH',
        data: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),

    changePassword: builder.mutation<{ message: string }, {
      currentPassword: string;
      newPassword: string;
    }>({
      query: (passwordData) => ({
        url: '/users/change-password',
        method: 'POST',
        data: passwordData,
      }),
    }),

    uploadProfileImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: '/users/profile/upload-image',
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
  useGetFareEstimationMutation,

  // Ride management
  useGetRideHistoryQuery,
  useGetRideDetailsQuery,
  useCancelRideRequestMutation,
  useRateDriverMutation,
  useRateDriverSimpleMutation,

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