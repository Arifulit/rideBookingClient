/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/baseApi";

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
    type: "sedan" | "suv" | "bike" | "auto";
  };
  licenseInfo: {
    number: string;
    expiryDate: string;
    verificationStatus: "pending" | "approved" | "rejected";
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
  rideType: "economy" | "premium" | "luxury";
  estimatedFare: number;
  estimatedDistance: number;
  estimatedDuration: number;
  requestedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  paymentMethod: "cash" | "card" | "wallet";
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
  rideType: "economy" | "premium" | "luxury";
  status:
    | "accepted"
    | "driver-arriving"
    | "driver-arrived"
    | "in-progress"
    | "completed"
    | "cancelled";
  fare: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    total: number;
  };
  paymentMethod: "cash" | "card" | "wallet";
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
    status: "completed" | "cancelled";
    fare: number;
    distance: number;
    duration: number;
    rating?: number;
    tips?: number;
    completedAt: string;
    paymentMethod: "cash" | "card" | "wallet";
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

// Minimal Rider shape returned by /drivers/riders
export type Rider = {
  vehicleModel: any;
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  rating?: number;
  profileImage?: string;
  createdAt?: string;
};

import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export const driverApi = baseApi.injectEndpoints({
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({
    // Get driver profile (backend driver router mounted at /driver)
    getDriverProfile: builder.query({
      query: () => ({ url: "/drivers/profile" }),
      providesTags: ["DriverProfile"],
    }),

  
    // Update driver profile
    updateDriverProfile: builder.mutation<
      DriverProfile,
      Partial<DriverProfile> | FormData
    >({
      query: (profileData) => {
        const isForm =
          typeof FormData !== "undefined" && profileData instanceof FormData;

        return {
          url: "/drivers/profile",
          method: "PATCH",
          // axiosBaseQuery expects `data` (not `body`)
          data: isForm ? (profileData as unknown) : JSON.stringify(profileData),
          headers: isForm ? undefined : { "Content-Type": "application/json" },
        };
      },
      invalidatesTags: ["DriverProfile"],
    }),
// ...existing code...

    // Update driver availability status
    updateDriverAvailability: builder.mutation<
      { success: boolean; message?: string; data?: { isOnline?: boolean } },
      boolean | { isAvailable?: boolean; isOnline?: boolean }
    >({
      query: (payload) => {
        // accept either boolean or object { isAvailable: true } and convert to { isOnline: boolean }
        const isOnline =
          typeof payload === "boolean"
            ? Boolean(payload)
            : Boolean(
                (payload as any).isOnline ?? (payload as any).isAvailable
              );

        return {
          url: "/drivers/availability",
          method: "PATCH",
          body: JSON.stringify({ isOnline }),
          headers: { "Content-Type": "application/json" },
        };
      },
      invalidatesTags: ["DriverProfile"],
    }),

    // Update driver online status
  
// Update driver online status
// Update driver online status
updateDriverOnlineStatus: builder.mutation<
  {
    data: any;
    isOnline: boolean;
    message: string;
  },
  boolean // ✅ Accepts boolean as argument
>({
  query: (isOnline) => ({
    url: "/drivers/online-status",
    method: "PATCH",
    body: { isOnline: Boolean(isOnline) }, // ✅ Wraps boolean in object
    headers: { "Content-Type": "application/json" },
  }),
  invalidatesTags: ["DriverProfile"],
}),

    // Update driver location
    updateDriverLocation: builder.mutation<
      {
        location: { latitude: number; longitude: number; address: string };
        message: string;
      },
      {
        latitude: number;
        longitude: number;
        address?: string;
      }
    >({
      query: (locationData) => ({
        url: "/drivers/location",
        method: "PATCH",
        body: JSON.stringify(locationData),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["DriverProfile"],
    }),

    // ...existing code...
    // Get incoming ride requests (driver router)
    getIncomingRequests: builder.query<RideRequest[], void>({
      query: () => ({ url: "/drivers/rides/pending" }),
      providesTags: ["IncomingRequests"],
    }),

    // Get all ride requests / showAll (backend endpoint given by user)
    // Example backend: /api/v1/driver/rides/requests?showAll=true
    getRideRequests: builder.query<RideRequest[], { showAll?: boolean } | void>(
      {
        query: (params = { showAll: true }) => ({
          url: "/drivers/rides/requests",
          params,
        }),
        // Normalize and log backend responses so frontend receives a stable array shape
        transformResponse: (response: unknown) => {
          // Log raw response in browser devtools for easier debugging
          console.debug("driverApi.getRideRequests - raw response:", response);

          if (!response) return [] as RideRequest[];
          if (Array.isArray(response)) {
            console.debug(
              "driverApi.getRideRequests - normalized (array):",
              response
            );
            return response as RideRequest[];
          }
          if (typeof response === "object" && response !== null) {
            const obj = response as Record<string, unknown>;
            if (Array.isArray(obj.data)) {
              console.debug(
                "driverApi.getRideRequests - normalized (data):",
                obj.data
              );
              return obj.data as RideRequest[];
            }
            if (Array.isArray(obj.requests)) {
              console.debug(
                "driverApi.getRideRequests - normalized (requests):",
                obj.requests
              );
              return obj.requests as RideRequest[];
            }
            const firstArray = Object.values(obj).find((v) => Array.isArray(v));
            if (Array.isArray(firstArray)) {
              console.debug(
                "driverApi.getRideRequests - normalized (firstArray):",
                firstArray
              );
              return firstArray as RideRequest[];
            }
          }
          return [] as RideRequest[];
        },
        providesTags: ["IncomingRequests", "RideRequests"],
      }
    ),

    // Accept ride request (global ride router)
    acceptRideRequest: builder.mutation<ActiveRide, string>({
      query: (rideId) => ({
        // backend uses plural 'rides' (e.g. /api/v1/rides/:id/accept)
        url: `/rides/${rideId}/accept`,
        method: "PATCH",
      }),
      invalidatesTags: ["IncomingRequests", "ActiveRide"],
    }),

    // Reject ride request (global ride router)
    rejectRideRequest: builder.mutation<
      { message: string; success: boolean },
      string
    >({
      query: (rideId) => ({
        // backend uses plural 'rides'
        url: `/rides/${rideId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["IncomingRequests"],
    }),

    // Get active ride (driver router)
    getActiveRide: builder.query<ActiveRide | null, void>({
      query: () => ({ url: "/drivers/rides/active" }),
      providesTags: ["ActiveRide"],
    }),

    // Update ride status (driver actions)
    // Accepts payloads such as:
    // { status: 'picked_up', notes: 'Passenger on board' }
    // { status: 'in_transit' }
    // { status: 'completed', finalFare: 250, endLocation: { latitude, longitude } }
    updateRideStatus: builder.mutation<
      ActiveRide,
      {
        rideId: string;
        status: ActiveRide["status"];
        notes?: string;
        finalFare?: number;
        endLocation?: { latitude: number; longitude: number };
        location?: { latitude: number; longitude: number };
      }
    >({
      query: ({ rideId, status, notes, finalFare, endLocation, location }) => {
        // The backend validates enum values in snake_case (e.g. 'driver_arrived', 'in_progress').
        // Convert frontend hyphenated/status values to snake_case before sending.
        const toSnake = (s?: string) => (s ? s.replace(/-/g, "_") : s);
        const payload = {
          status: toSnake(status as string),
          notes,
          finalFare,
          endLocation,
          location,
        } as Record<string, unknown>;

        return {
          // backend uses plural 'rides'
          url: `/rides/${rideId}/status`,
          method: "PATCH",
          data: payload,
        };
      },
      // Optimistic update so UI shows new status immediately
      async onQueryStarted({ rideId, status }, { dispatch, queryFulfilled }) {
        const toSnake = (s?: string) => (s ? s.replace(/-/g, "_") : s);
        const newStatus = toSnake(status as string) as ActiveRide["status"];

        // Patch getActiveRide (no args)
        const patchActive = dispatch(
          driverApi.util.updateQueryData(
            "getActiveRide",
            undefined,
            (draft?: ActiveRide | null) => {
              try {
                if (!draft) return;
                const d = draft as ActiveRide;
                if (String(d.id) === String(rideId)) {
                  // mutating immer draft; mark as ActiveRide
                  (d as ActiveRide).status = newStatus;
                }
              } catch {
                // ignore
              }
            }
          )
        );

        // Patch getRideRequests (common call uses { showAll: true })
        let patchRequests: { undo: () => void } | null = null;
        try {
          patchRequests = dispatch(
            driverApi.util.updateQueryData(
              "getRideRequests",
              { showAll: true },
              (draft: unknown) => {
                if (!draft) return;
                // draft could be array or object – handle common shapes
                let list: Array<Record<string, unknown>> | null = null;
                if (Array.isArray(draft)) {
                  list = draft as unknown as Array<Record<string, unknown>>;
                } else if (typeof draft === "object" && draft !== null) {
                  const obj = draft as Record<string, unknown>;
                  if (Array.isArray(obj.data))
                    list = obj.data as unknown as Array<
                      Record<string, unknown>
                    >;
                  else if (Array.isArray(obj.requests))
                    list = obj.requests as unknown as Array<
                      Record<string, unknown>
                    >;
                }
                if (!list) return;
                for (const item of list) {
                  const id = String(item["id"] ?? item["_id"] ?? "");
                  if (id === String(rideId)) {
                    item["status"] = newStatus as unknown as string;
                  }
                }
              }
            )
          );
        } catch {
          patchRequests = null;
        }

        try {
          await queryFulfilled;
        } catch {
          // rollback
          try {
            patchActive.undo();
          } catch {
            /* ignore */
          }
          try {
            patchRequests?.undo();
          } catch {
            /* ignore */
          }
        }
      },
      invalidatesTags: ["ActiveRide", "RideHistory", "Earnings"],
    }),

    // Complete ride
    completeRide: builder.mutation<
      { ride: ActiveRide; earnings: number; message: string },
      {
        rideId: string;
        finalLocation: { latitude: number; longitude: number };
        actualDistance?: number;
        actualDuration?: number;
      }
    >({
      query: (completeData) => {
        // Ensure any status-like fields are snake_cased if present by backend expectations.
        const normalizeComplete = { ...completeData } as Record<
          string,
          unknown
        >;
        if (
          normalizeComplete.status &&
          typeof normalizeComplete.status === "string"
        ) {
          normalizeComplete.status = (
            normalizeComplete.status as string
          ).replace(/-/g, "_");
        }

        return {
          // backend uses plural 'rides'
          url: `/rides/${completeData.rideId}/complete`,
          method: "POST",
          data: normalizeComplete,
        };
      },
      // Optimistic update for completing a ride: mark active ride status as completed immediately
      async onQueryStarted({ rideId }, { dispatch, queryFulfilled }) {
        const patchActive = dispatch(
          driverApi.util.updateQueryData(
            "getActiveRide",
            undefined,
            (draft?: ActiveRide | null) => {
              try {
                if (!draft) return;
                const d = draft as ActiveRide;
                if (String(d.id) === String(rideId)) {
                  (d as ActiveRide).status = "completed";
                }
              } catch {
                // ignore
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          try {
            patchActive.undo();
          } catch {
            /* ignore */
          }
        }
      },
      invalidatesTags: ["ActiveRide", "RideHistory"],
    }),

    // Get driver earnings (backend endpoint moved to /drivers/earnings/detailed)
    getDriverEarnings: builder.query<
      DriverEarnings,
      {
        period?: "daily" | "weekly" | "monthly";
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params = {}) => ({
        url: "/driver/earnings/detailed",
        params,
      }),
      providesTags: ["Earnings"],
    }),

    // Get ride history
    getRideHistory: builder.query<
      DriverRideHistory,
      {
        page?: number;
        limit?: number;
        status?: "completed" | "cancelled";
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params = {}) => ({
        url: "/driver/rides/history",
        params,
      }),
      providesTags: ["RideHistory"],
    }),

    // Update driver documents
    updateDriverDocuments: builder.mutation<
      DriverProfile,
      {
        licenseImage?: File;
        vehicleRegistration?: File;
        insurance?: File;
      }
    >({
      query: (documents) => {
        const formData = new FormData();
        Object.entries(documents).forEach(([key, file]) => {
          if (file) formData.append(key, file);
        });
        return {
          url: "/drivers/documents",
          method: "PUT",
          data: formData,
        };
      },
      invalidatesTags: ["DriverProfile"],
    }),

    // Get driver analytics
    getDriverAnalytics: builder.query<
      {
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
      },
      {
        period?: "week" | "month" | "year";
      }
    >({
      query: (params = {}) => ({
        url: "/drivers/analytics",
        params,
      }),
      providesTags: ["Analytics"],
    }),
    // Get all riders (driver-only endpoint)
    getAllRiders: builder.query<Rider[], void>({
      query: () => ({ url: "/drivers/riders", method: "GET" }),
      // The backend may wrap results differently across environments. Normalize common shapes here so
      // the frontend always receives an array of riders.
      transformResponse: (response: unknown) => {
        let raw: unknown[] = [];
        if (!response) return [] as Rider[];

        if (Array.isArray(response)) raw = response;
        else if (typeof response === "object" && response !== null) {
          const respObj = response as Record<string, unknown>;
          const candidates = ["data", "riders", "items", "result"];
          for (const key of candidates) {
            if (Array.isArray(respObj[key])) {
              raw = respObj[key] as unknown[];
              break;
            }
          }
          if (raw.length === 0) {
            const firstArray = Object.values(respObj).find((v) =>
              Array.isArray(v)
            );
            if (Array.isArray(firstArray)) raw = firstArray as unknown[];
          }
        }

        // Normalize each item to the Rider type expected by the frontend
        const normalized: Rider[] = raw.map((item) => {
          const obj = item as unknown as Record<string, unknown>;
          const id =
            obj.id ??
            obj._id ??
            obj.uid ??
            obj.userId ??
            obj._uid ??
            obj.riderId ??
            "";
          const name = typeof obj.name === "string" ? obj.name : undefined;
          const firstName =
            (obj.firstName as string) ??
            (obj.firstname as string) ??
            (obj.first_name as string) ??
            name?.split?.(" ")?.[0] ??
            "";
          const lastName =
            (obj.lastName as string) ??
            (obj.lastname as string) ??
            (obj.last_name as string) ??
            name?.split?.(" ")?.slice(1).join(" ") ??
            "";
          const email =
            (obj.email as string) ??
            (obj.mail as string) ??
            (obj.emailAddress as string) ??
            (obj.email_address as string) ??
            "";
          const phone =
            (obj.phone as string) ??
            (obj.mobile as string) ??
            (obj.phoneNumber as string) ??
            (obj.phone_number as string) ??
            "";
          const ratingRaw = obj.rating;
          const rating =
            typeof ratingRaw === "number"
              ? ratingRaw
              : typeof ratingRaw === "string"
              ? Number(ratingRaw)
              : undefined;
          const profileImage =
            (obj.profileImage as string) ??
            (obj.avatar as string) ??
            (obj.image as string) ??
            (obj.picture as string) ??
            undefined;
          const createdAt =
            (obj.createdAt as string) ??
            (obj.created_at as string) ??
            (obj.created as string) ??
            undefined;

          return {
            id: String(id),
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: phone || undefined,
            email: email || undefined,
            rating:
              typeof rating === "number" && !Number.isNaN(rating)
                ? rating
                : undefined,
            profileImage: profileImage || undefined,
            createdAt: createdAt || undefined,
          } as Rider;
        });

        return normalized;
      },
      providesTags: ["RidersList"],
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
  useGetRideRequestsQuery,
  useAcceptRideRequestMutation,
  useRejectRideRequestMutation,
  useGetActiveRideQuery,
  useUpdateRideStatusMutation,
  useCompleteRideMutation,
  useGetDriverEarningsQuery,
  useGetRideHistoryQuery,
  useUpdateDriverDocumentsMutation,
  useGetDriverAnalyticsQuery,
  useGetAllRidersQuery,
} = driverApi;

// Export aliases for backward compatibility
export const useRespondToRequestMutation = useAcceptRideRequestMutation;
export const useCancelRideMutation = useUpdateRideStatusMutation;
