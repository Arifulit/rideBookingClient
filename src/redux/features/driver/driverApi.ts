import { baseApi } from '@/redux/baseApi';

export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    type: 'sedan' | 'suv' | 'bike' | 'auto';
  };
  licenseInfo: {
    number: string;
    expiryDate: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
  };
  documents?: {
    license?: string;
    vehicleRegistration?: string;
    insurance?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RideRequest {
  id: string;
  riderId: string;
  rider: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    profileImage?: string;
    rating: number;
  };
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destinationLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  rideType: 'economy' | 'premium' | 'luxury';
  estimatedFare: number;
  estimatedDistance: number;
  estimatedDuration: number;
  requestedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  paymentMethod: 'cash' | 'card' | 'wallet';
  passengers: number;
  notes?: string;
}

export interface ActiveRide {
  id: string;
  riderId: string;
  driverId: string;
  rider: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    profileImage?: string;
  };
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destinationLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  rideType: 'economy' | 'premium' | 'luxury';
  status: 'accepted' | 'driver-arriving' | 'driver-arrived' | 'in-progress' | 'completed' | 'cancelled';
  fare: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    total: number;
  };
  paymentMethod: 'cash' | 'card' | 'wallet';
  acceptedAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  actualDistance?: number;
  actualDuration?: number;
}

export interface DriverEarnings {
  daily: {
    date: string;
    rides: number;
    totalEarnings: number;
    onlineHours: number;
  }[];
  weekly: {
    week: string;
    rides: number;
    totalEarnings: number;
    onlineHours: number;
  }[];
  monthly: {
    month: string;
    rides: number;
    totalEarnings: number;
    onlineHours: number;
  }[];
  summary: {
    totalEarnings: number;
    totalRides: number;
    averageRating: number;
    totalOnlineHours: number;
    earningsThisWeek: number;
    earningsThisMonth: number;
    ridesThisWeek: number;
    ridesThisMonth: number;
  };
}

export interface DriverRideHistory {
  rides: {
    id: string;
    rider: {
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
    pickupAddress: string;
    destinationAddress: string;
    status: 'completed' | 'cancelled';
    fare: number;
    distance: number;
    duration: number;
    rating?: number;
    tips?: number;
    completedAt: string;
    paymentMethod: 'cash' | 'card' | 'wallet';
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters?: {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    status?: string;
    minFare?: number;
    maxFare?: number;
  };
}

export const driverApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get driver profile
    getDriverProfile: builder.query<DriverProfile, void>({
      query: () => ({ url: '/users/profile' }),
      providesTags: ['DriverProfile'],
    }),

    // Update driver profile
    updateDriverProfile: builder.mutation<DriverProfile, Partial<DriverProfile>>({
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['DriverProfile'],
    }),

    // Update driver availability status
    updateDriverAvailability: builder.mutation<{ isAvailable: boolean; message: string }, boolean>({
      query: (isAvailable) => ({
        url: '/drivers/availability',
        method: 'PATCH',
        body: { isAvailable },
      }),
      invalidatesTags: ['DriverProfile'],
    }),

    // Update driver online status
    updateDriverOnlineStatus: builder.mutation<{ isOnline: boolean; message: string }, boolean>({
      query: (isOnline) => ({
        url: '/driver/online-status',
        method: 'PUT',
        body: { isOnline },
      }),
      invalidatesTags: ['DriverProfile'],
    }),

    // Update driver location
    updateDriverLocation: builder.mutation<{ 
      location: { latitude: number; longitude: number; address: string }; 
      message: string;
    }, {
      latitude: number;
      longitude: number;
      address?: string;
    }>({
      query: (locationData) => ({
        url: '/driver/location',
        method: 'PUT',
        body: locationData,
      }),
      invalidatesTags: ['DriverProfile'],
    }),

    // Get incoming ride requests
    getIncomingRequests: builder.query<RideRequest[], void>({
      query: () => ({ url: '/driver/requests/incoming' }),
      providesTags: ['IncomingRequests'],
    }),

    // Accept ride request
    acceptRideRequest: builder.mutation<ActiveRide, string>({
      query: (requestId) => ({
        url: `/driver/requests/${requestId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['IncomingRequests', 'ActiveRide'],
    }),

    // Reject ride request
    rejectRideRequest: builder.mutation<{ message: string; success: boolean }, string>({
      query: (requestId) => ({
        url: `/driver/requests/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['IncomingRequests'],
    }),

    // Get active ride
    getActiveRide: builder.query<ActiveRide | null, void>({
      query: () => ({ url: '/driver/ride/active' }),
      providesTags: ['ActiveRide'],
    }),

    // Update ride status
    updateRideStatus: builder.mutation<ActiveRide, { 
      rideId: string; 
      status: ActiveRide['status'];
      location?: { latitude: number; longitude: number };
    }>({
      query: ({ rideId, status, location }) => ({
        url: `/driver/ride/${rideId}/status`,
        method: 'PUT',
        body: { status, location },
      }),
      invalidatesTags: ['ActiveRide', 'RideHistory', 'Earnings'],
    }),

    // Complete ride
    completeRide: builder.mutation<{ ride: ActiveRide; earnings: number; message: string }, {
      rideId: string;
      finalLocation: { latitude: number; longitude: number };
      actualDistance?: number;
      actualDuration?: number;
    }>({
      query: (completeData) => ({
        url: `/driver/ride/${completeData.rideId}/complete`,
        method: 'POST',
        body: completeData,
      }),
      invalidatesTags: ['ActiveRide', 'RideHistory'],
    }),

    // Get driver earnings
    getDriverEarnings: builder.query<DriverEarnings, {
      period?: 'daily' | 'weekly' | 'monthly';
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => ({
        url: '/driver/earnings',
        params,
      }),
      providesTags: ['Earnings'],
    }),

    // Get ride history
    getRideHistory: builder.query<DriverRideHistory, {
      page?: number;
      limit?: number;
      status?: 'completed' | 'cancelled';
      startDate?: string;
      endDate?: string;
    }>({
      query: (params = {}) => ({
        url: 'drivers/rides/history',
        params,
      }),
      providesTags: ['RideHistory'],
    }),

    // Update driver documents
    updateDriverDocuments: builder.mutation<DriverProfile, {
      licenseImage?: File;
      vehicleRegistration?: File;
      insurance?: File;
    }>({
      query: (documents) => {
        const formData = new FormData();
        Object.entries(documents).forEach(([key, file]) => {
          if (file) formData.append(key, file);
        });
        return {
          url: '/driver/documents',
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['DriverProfile'],
    }),

    // Get driver analytics
    getDriverAnalytics: builder.query<{
      totalRides: number;
      totalEarnings: number;
      averageRating: number;
      completionRate: number;
      onlineHours: number;
      peakHoursEarnings: number;
      weeklyGrowth: number;
      monthlyGrowth: number;
      ridesByHour: Array<{ hour: number; rides: number }>;
      earningsByDay: Array<{ day: string; earnings: number }>;
      ratingTrend: Array<{ date: string; rating: number }>;
    }, {
      period?: 'week' | 'month' | 'year';
    }>({
      query: (params = {}) => ({
        url: '/driver/analytics',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetDriverProfileQuery,
  useUpdateDriverProfileMutation,
  useUpdateDriverAvailabilityMutation,
  useUpdateDriverOnlineStatusMutation,
  useUpdateDriverLocationMutation,
  useGetIncomingRequestsQuery,
  useAcceptRideRequestMutation,
  useRejectRideRequestMutation,
  useGetActiveRideQuery,
  useUpdateRideStatusMutation,
  useCompleteRideMutation,
  useGetDriverEarningsQuery,
  useGetRideHistoryQuery,
  useUpdateDriverDocumentsMutation,
  useGetDriverAnalyticsQuery,
} = driverApi;

// Export aliases for backward compatibility
export const useRespondToRequestMutation = useAcceptRideRequestMutation;
export const useCancelRideMutation = useUpdateRideStatusMutation;