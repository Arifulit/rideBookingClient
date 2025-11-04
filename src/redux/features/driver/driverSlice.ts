/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DriverProfile, RideRequest, ActiveRide } from './driverApi';

export interface DriverState {
  profile: DriverProfile | null;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  incomingRequests: RideRequest[];
  activeRide: ActiveRide | null;
  earnings: {
    today: number;
    week: number;
    month: number;
  };
  notifications: {
    id: string;
    type: 'ride_request' | 'ride_update' | 'payment' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }[];
  settings: {
    autoAcceptRides: boolean;
    maxDistance: number; // in kilometers
    preferredRideTypes: ('economy' | 'premium' | 'luxury')[];
    notifications: {
      sound: boolean;
      vibration: boolean;
      push: boolean;
    };
  };
}

const initialState: DriverState = {
  profile: null,
  isOnline: false,
  isAvailable: false,
  currentLocation: null,
  incomingRequests: [],
  activeRide: null,
  earnings: {
    today: 0,
    week: 0,
    month: 0,
  },
  notifications: [],
  settings: {
    autoAcceptRides: false,
    maxDistance: 10,
    preferredRideTypes: ['economy', 'premium'],
    notifications: {
      sound: true,
      vibration: true,
      push: true,
    },
  },
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setProfile: (state: DriverState, action: PayloadAction<DriverProfile>) => {
      state.profile = action.payload;
      state.isOnline = action.payload.isOnline;
      state.isAvailable = action.payload.isAvailable;
    },

    updateAvailabilityStatus: (state: DriverState, action: PayloadAction<{ isOnline: boolean; isAvailable?: boolean }>) => {
      state.isOnline = action.payload.isOnline;
      if (action.payload.isAvailable !== undefined) {
        state.isAvailable = action.payload.isAvailable;
      }
      // If going offline, set unavailable
      if (!action.payload.isOnline) {
        state.isAvailable = false;
      }
    },

    updateCurrentLocation: (state: DriverState, action: PayloadAction<{ latitude: number; longitude: number; address: string }>) => {
      state.currentLocation = action.payload;
      if (state.profile) {
        state.profile.currentLocation = {
          ...action.payload,
          lastUpdated: new Date().toISOString(),
        };
      }
    },

    addIncomingRequest: (state: DriverState, action: PayloadAction<RideRequest>) => {
      // Avoid duplicates
      const exists = state.incomingRequests.some(req => req.id === action.payload.id);
      if (!exists) {
        state.incomingRequests.push(action.payload);
        
        // Add notification
        state.notifications.unshift({
          id: `request_${action.payload.id}`,
          type: 'ride_request',
          title: 'New Ride Request',
          message: `Ride request from ${action.payload.rider.firstName} ${action.payload.rider.lastName}`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    },

    removeIncomingRequest: (state: DriverState, action: PayloadAction<string>) => {
      state.incomingRequests = state.incomingRequests.filter(req => req.id !== action.payload);
    },

    setActiveRide: (state: DriverState, action: PayloadAction<ActiveRide | null>) => {
      state.activeRide = action.payload;
      if (action.payload) {
        // Remove from incoming requests if it exists
        state.incomingRequests = state.incomingRequests.filter(req => req.id !== action.payload!.id);
        
        // Set as unavailable when having active ride
        state.isAvailable = false;
        
        // Add notification
        state.notifications.unshift({
          id: `ride_${action.payload.id}`,
          type: 'ride_update',
          title: 'Ride Accepted',
          message: `You've accepted a ride request from ${action.payload.rider.firstName}`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      } else {
        // Set as available when no active ride (if online)
        if (state.isOnline) {
          state.isAvailable = true;
        }
      }
    },

    updateRideStatus: (state: DriverState, action: PayloadAction<{ status: ActiveRide['status']; timestamp?: string }>) => {
      if (state.activeRide) {
        state.activeRide.status = action.payload.status;
        
        const statusMessages: Record<ActiveRide['status'], string> = {
          'accepted': 'Ride accepted',
          'driver-arriving': 'On your way to pickup',
          'driver-arrived': 'Arrived at pickup location',
          'in-progress': 'Ride started',
          'completed': 'Ride completed',
          'cancelled': 'Ride cancelled',
        };

        // Add notification
        state.notifications.unshift({
          id: `status_${Date.now()}`,
          type: 'ride_update',
          title: 'Ride Status Updated',
          message: statusMessages[action.payload.status as ActiveRide['status']],
          timestamp: action.payload.timestamp || new Date().toISOString(),
          read: false,
        });

        // Clear active ride if completed or cancelled
        if (['completed', 'cancelled'].includes(action.payload.status)) {
          state.activeRide = null;
          // Set as available again if online
          if (state.isOnline) {
            state.isAvailable = true;
          }
        }
      }
    },

    updateEarnings: (state: { earnings: { today: any; week: any; month: any; }; }, action: PayloadAction<{ today?: number; week?: number; month?: number }>) => {
      if (action.payload.today !== undefined) state.earnings.today = action.payload.today;
      if (action.payload.week !== undefined) state.earnings.week = action.payload.week;
      if (action.payload.month !== undefined) state.earnings.month = action.payload.month;
    },

    addNotification: (state: { notifications: any[]; }, action: PayloadAction<Omit<DriverState['notifications'][0], 'id' | 'timestamp' | 'read'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    },

    markNotificationAsRead: (state: { notifications: any[]; }, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    markAllNotificationsAsRead: (state: { notifications: any[]; }) => {
      state.notifications.forEach(n => n.read = true);
    },

    removeNotification: (state: { notifications: any[]; }, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    updateSettings: (state: { settings: any; }, action: PayloadAction<Partial<DriverState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    resetDriverState: () => initialState,
  },
});

export const {
  setProfile,
  updateAvailabilityStatus,
  updateCurrentLocation,
  addIncomingRequest,
  removeIncomingRequest,
  setActiveRide,
  updateRideStatus,
  updateEarnings,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  updateSettings,
  resetDriverState,
} = driverSlice.actions;

export default driverSlice.reducer;