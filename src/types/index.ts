import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'rider' | 'driver' | 'admin';
  isBlocked?: boolean;
  driver?: DriverInfo;
  accountStatus?: 'active' | 'blocked' | 'suspended' | 'pending_verification' | 'offline_restricted';
  status?: 'active' | 'blocked' | 'suspended' | 'pending_verification' | 'offline_restricted' | 'unknown';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLoginAt?: string;
  // Driver-specific properties (only relevant for driver role)
  totalEarnings?: number;
  totalRides?: number;
  rating?: number;
  // Admin-specific properties
  permissions?: string[];
}

export interface DriverInfo {
  licenseNumber: string;
  vehicleInfo: VehicleInfo;
  isApproved: boolean;
  isAvailable: boolean;
  location?: Location;
  rating?: number;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: 'sedan' | 'suv' | 'bike' | 'auto';
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickupLocation: Location;
  destination: Location;
  rideType: 'standard' | 'premium' | 'shared';
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'wallet';
  fare?: number;
  distance?: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  rider?: User;
  driver?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface RideState {
  rides: Ride[];
  currentRide: Ride | null;
  loading: boolean;
  error: string | null;
}

export interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    component: ComponentType;
  }[];
}

// Additional missing types
export type TRole = 'rider' | 'driver' | 'admin';

export interface IVerifyOtp {
  email: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: 'Bearer';
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface ISendOtp {
  email?: string;
  phone?: string;
}

export interface ISendEmailOtp {
  email: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}
