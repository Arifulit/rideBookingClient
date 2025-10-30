
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    'Rides',
    'Ride', // single ride tag
    'Profile'
  ],
  endpoints: (builder) => ({
    // Location Services
    searchLocations: builder.query<Location[], { query: string } | string>({
      query: (arg: { query: any } | string) => {
        const q = typeof arg === 'string' ? arg : (arg as any)?.query ?? '';
        return {
          url: '/places/search',
          method: 'GET',
          params: { q },
        };
      },
      providesTags: ['Location'],
    }),

    // Create ride request
    requestRide: builder.mutation<Ride, RideRequest>({
      query: (rideData) => ({
        url: '/rides/request',
        method: 'POST',
        data: rideData,
      }),
      transformResponse: (response: any) => {
        const payload = response && response.data ? response.data : response;
        return payload && payload.data && payload.data.ride ? payload.data.ride : payload?.ride ?? payload;
      },
      invalidatesTags: ['RideRequest', 'Rides'],
    }),

    // Get ride details
    getRideDetails: builder.query<Ride, string>({
      query: (rideId) => ({
        url: `/rides/${rideId}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const payload = response && response.data ? response.data : response;
        return payload && payload.data && payload.data.ride ? payload.data.ride : payload?.ride ?? payload;
      },
      providesTags: (_result, _error, rideId) => [{ type: 'Ride' as const, id: rideId }],
    }),

    // Fare estimation
    getFareEstimation: builder.mutation<FareEstimation, {
      pickup: { latitude: number; longitude: number; address?: string };
      destination: { latitude: number; longitude: number; address?: string };
      rideType?: 'economy' | 'premium' | 'luxury' | string;
    }>({
      query: ({ pickup, destination, rideType = 'economy' }) => {
        const toLocationPoint = (loc: { latitude: number; longitude: number; address?: string }) => ({
          address: loc.address ?? '',
          coordinates: {
            type: 'Point' as const,
            coordinates: [loc.longitude, loc.latitude], // [lon, lat]
          },
        });

        return {
          url: '/rides/estimate',
          method: 'POST',
          data: {
            pickupLocation: toLocationPoint(pickup),
            destination: toLocationPoint(destination),
            rideType,
          },
        };
      },
      transformResponse: (response: any) => {
        const payload = response && response.data ? response.data : response;
        return payload?.data ?? payload;
      },
    }),

    // Search nearby drivers
    searchDrivers: builder.mutation<Driver[], { latitude: number; longitude: number; radius: number }>({
      query: (coords) => ({
        url: '/ride/search-drivers',
        method: 'POST',
        data: coords,
      }),
    }),

    // Ride history (query)
    getRideHistory: builder.query<RideHistory, RideSearchParams>({
      query: (params) => ({
        url: '/rides/history',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        const payload = response && response.data ? response.data : response;
        if (payload?.data?.rides) return payload.data;
        if (Array.isArray(payload?.rides)) return { rides: payload.rides, total: payload.total ?? payload.rides.length };
        if (Array.isArray(payload)) return { rides: payload, total: payload.length };
        return payload ?? { rides: [], total: 0 };
      },
      providesTags: ['Rides'],
    }),

    // Ride history (mutation) - manual trigger when needed
    getRideHistoryMutation: builder.mutation<RideHistory, RideSearchParams>({
      query: (params) => ({
        url: '/rides/history',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        const payload = response && response.data ? response.data : response;
        if (payload?.data?.rides) return payload.data;
        if (Array.isArray(payload?.rides)) return { rides: payload.rides, total: payload.total ?? payload.rides.length };
        if (Array.isArray(payload)) return { rides: payload, total: payload.length };
        return payload ?? { rides: [], total: 0 };
      },
      invalidatesTags: ['Rides'],
    }),

    // Cancel ride
    cancelRideRequest: builder.mutation<Ride, { rideId: string; reason?: string }>({
      query: ({ rideId, reason }) => ({
        url: `/ride/${rideId}/cancel`,
        method: 'PATCH',
        data: { reason },
      }),
      invalidatesTags: (_result, _error, { rideId }) => [{ type: 'Ride' as const, id: rideId }, 'Rides'],
    }),

    // Rate driver
    rateDriver: builder.mutation<Ride, {
      rideId: string;
      driverId: string;
      rating: number;
      comment?: string;
    }>({
      query: ({ rideId, driverId, rating, comment }) => ({
        url: `/ride/${rideId}/rate`,
        method: 'PATCH',
        data: { driverId, rating, comment },
      }),
      invalidatesTags: (_result, _error, { rideId }) => [{ type: 'Ride' as const, id: rideId }, 'Rides'],
    }),

    rateDriverSimple: builder.mutation<Ride, { rideId: string; rating: number; feedback?: string }>({
      query: ({ rideId, rating, feedback }) => ({
        url: `/ride/${rideId}/rate`,
        method: 'PATCH',
        data: { rating, comment: feedback },
      }),
      invalidatesTags: (_result, _error, { rideId }) => [{ type: 'Ride' as const, id: rideId }, 'Rides'],
    }),

    // Live tracking
    getLiveRideTracking: builder.query<LiveRideTracking, string>({
      query: (rideId) => ({
        url: `/ride/${rideId}/tracking`,
        method: 'GET',
      }),
      providesTags: (_result, _error, rideId) => [{ type: 'LiveRide' as const, id: rideId }],
    }),

    // Profile management
    getRiderProfile: builder.query<RiderProfile, void>({
      query: () => ({
        url: '/users/profile',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const payload = response && response.data ? response.data : response;
        return payload && payload.data ? payload.data.rider ?? payload.data.user ?? payload.data : payload;
      },
      providesTags: ['Profile'],
    }),

    updateRiderProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        data: body,
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

    // Payment methods
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

    // Additional location services
    searchPlaces: builder.query<Location[], string>({
      query: (searchQuery) => ({
        url: '/places/search',
        method: 'GET',
        params: { q: searchQuery },
      }),
      providesTags: ['Location'],
    }),

    getCurrentLocation: builder.query<Location, void>({
      queryFn: async () => {
        try {
          return await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation is not supported'));
              return;
            }

            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;

                try {
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
                maximumAge: 300000,
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
  useSearchPlacesQuery,
  useLazySearchPlacesQuery,

  // Ride requests & management
  useRequestRideMutation,
  useGetFareEstimationMutation,
  useGetRideHistoryQuery,
  useGetRideDetailsQuery,
  useGetRideHistoryMutationMutation,
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

  // Location helpers
  useGetCurrentLocationQuery,
  useLazyGetCurrentLocationQuery,
} = riderApi;

export default riderApi;