import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Ride, Location, RideFilter } from '@/types/rider';

interface RiderState {
  // Current ride state
  currentRide: Ride | null;
  
  // Ride request form state
  rideRequest: {
    pickupLocation: Location | null;
    destinationLocation: Location | null;
    rideType: 'economy' | 'premium' | 'luxury';
    scheduledTime: string | null;
    paymentMethod: 'cash' | 'card' | 'wallet';
    passengers: number;
    notes: string;
  };

  // UI state
  isRequestingRide: boolean;
  showLiveTracking: boolean;
  
  // Filters and search
  rideHistoryFilters: RideFilter;
  searchQuery: string;

  // Location state
  currentLocation: Location | null;
  isLoadingLocation: boolean;
  locationError: string | null;

  // Recently used locations
  recentPickupLocations: Location[];
  recentDestinations: Location[];
}

const initialState: RiderState = {
  currentRide: null,
  
  rideRequest: {
    pickupLocation: null,
    destinationLocation: null,
    rideType: 'economy',
    scheduledTime: null,
    paymentMethod: 'cash',
    passengers: 1,
    notes: '',
  },

  isRequestingRide: false,
  showLiveTracking: false,
  
  rideHistoryFilters: {},
  searchQuery: '',

  currentLocation: null,
  isLoadingLocation: false,
  locationError: null,

  recentPickupLocations: [],
  recentDestinations: [],
};

const riderSlice = createSlice({
  name: 'rider',
  initialState,
  reducers: {
    // Ride request management
    setPickupLocation: (state, action: PayloadAction<Location>) => {
      state.rideRequest.pickupLocation = action.payload;
      
      // Add to recent locations
      const existingIndex = state.recentPickupLocations.findIndex(
        loc => loc.address === action.payload.address
      );
      
      if (existingIndex === -1) {
        state.recentPickupLocations.unshift(action.payload);
        if (state.recentPickupLocations.length > 5) {
          state.recentPickupLocations.pop();
        }
      } else {
        // Move to front
        state.recentPickupLocations.splice(existingIndex, 1);
        state.recentPickupLocations.unshift(action.payload);
      }
    },

    setDestinationLocation: (state, action: PayloadAction<Location>) => {
      state.rideRequest.destinationLocation = action.payload;
      
      // Add to recent destinations
      const existingIndex = state.recentDestinations.findIndex(
        loc => loc.address === action.payload.address
      );
      
      if (existingIndex === -1) {
        state.recentDestinations.unshift(action.payload);
        if (state.recentDestinations.length > 5) {
          state.recentDestinations.pop();
        }
      } else {
        // Move to front
        state.recentDestinations.splice(existingIndex, 1);
        state.recentDestinations.unshift(action.payload);
      }
    },

    setRideType: (state, action: PayloadAction<'economy' | 'premium' | 'luxury'>) => {
      state.rideRequest.rideType = action.payload;
    },

    setScheduledTime: (state, action: PayloadAction<string | null>) => {
      state.rideRequest.scheduledTime = action.payload;
    },

    setPaymentMethod: (state, action: PayloadAction<'cash' | 'card' | 'wallet'>) => {
      state.rideRequest.paymentMethod = action.payload;
    },

    setPassengers: (state, action: PayloadAction<number>) => {
      state.rideRequest.passengers = Math.max(1, Math.min(4, action.payload));
    },

    setNotes: (state, action: PayloadAction<string>) => {
      state.rideRequest.notes = action.payload;
    },

    clearRideRequest: (state) => {
      state.rideRequest = initialState.rideRequest;
    },

    swapLocations: (state) => {
      const temp = state.rideRequest.pickupLocation;
      state.rideRequest.pickupLocation = state.rideRequest.destinationLocation;
      state.rideRequest.destinationLocation = temp;
    },

    // Current ride management
    setCurrentRide: (state, action: PayloadAction<Ride | null>) => {
      state.currentRide = action.payload;
      state.showLiveTracking = action.payload?.status === 'in_progress' || 
                                action.payload?.status === 'driver_assigned' ||
                                action.payload?.status === 'driver_arrived';
    },

    updateRideStatus: (state, action: PayloadAction<{ rideId: string; status: Ride['status'] }>) => {
      if (state.currentRide && state.currentRide.id === action.payload.rideId) {
        state.currentRide.status = action.payload.status;
        state.showLiveTracking = action.payload.status === 'in_progress' || 
                                  action.payload.status === 'driver_assigned' ||
                                  action.payload.status === 'driver_arrived';
      }
    },

    // UI state management
    setRequestingRide: (state, action: PayloadAction<boolean>) => {
      state.isRequestingRide = action.payload;
    },

    toggleLiveTracking: (state) => {
      state.showLiveTracking = !state.showLiveTracking;
    },

    // Filters and search
    setRideHistoryFilters: (state, action: PayloadAction<RideFilter>) => {
      state.rideHistoryFilters = action.payload;
    },

    updateRideHistoryFilter: (state, action: PayloadAction<Partial<RideFilter>>) => {
      state.rideHistoryFilters = {
        ...state.rideHistoryFilters,
        ...action.payload,
      };
    },

    clearRideHistoryFilters: (state) => {
      state.rideHistoryFilters = {};
      state.searchQuery = '';
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Location management
    setCurrentLocation: (state, action: PayloadAction<Location | null>) => {
      state.currentLocation = action.payload;
      state.locationError = null;
    },

    setLoadingLocation: (state, action: PayloadAction<boolean>) => {
      state.isLoadingLocation = action.payload;
    },

    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.locationError = action.payload;
      state.isLoadingLocation = false;
    },

    // Use current location as pickup
    useCurrentLocationAsPickup: (state) => {
      if (state.currentLocation) {
        state.rideRequest.pickupLocation = state.currentLocation;
      }
    },

    // Recently used locations management
    clearRecentLocations: (state) => {
      state.recentPickupLocations = [];
      state.recentDestinations = [];
    },

    removeRecentLocation: (state, action: PayloadAction<{ type: 'pickup' | 'destination'; address: string }>) => {
      const { type, address } = action.payload;
      
      if (type === 'pickup') {
        state.recentPickupLocations = state.recentPickupLocations.filter(
          loc => loc.address !== address
        );
      } else {
        state.recentDestinations = state.recentDestinations.filter(
          loc => loc.address !== address
        );
      }
    },

    // Reset entire state
    resetRiderState: (state) => {
      return initialState;
    },
  },
});

export const {
  // Ride request actions
  setPickupLocation,
  setDestinationLocation,
  setRideType,
  setScheduledTime,
  setPaymentMethod,
  setPassengers,
  setNotes,
  clearRideRequest,
  swapLocations,
  
  // Current ride actions
  setCurrentRide,
  updateRideStatus,
  
  // UI actions
  setRequestingRide,
  toggleLiveTracking,
  
  // Filter actions
  setRideHistoryFilters,
  updateRideHistoryFilter,
  clearRideHistoryFilters,
  setSearchQuery,
  
  // Location actions
  setCurrentLocation,
  setLoadingLocation,
  setLocationError,
  useCurrentLocationAsPickup,
  
  // Recent locations
  clearRecentLocations,
  removeRecentLocation,
  
  // Reset
  resetRiderState,
} = riderSlice.actions;

export default riderSlice.reducer;