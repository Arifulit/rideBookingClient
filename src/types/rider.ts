// Rider specific types and interfaces

// Base types and enums
export type RideStatus = 'pending' | 'accepted' | 'driver-arriving' | 'in-progress' | 'completed' | 'cancelled';
export type RideType = 'economy' | 'premium' | 'luxury';
export type PaymentMethodType = 'cash' | 'card' | 'wallet';

export interface Location {
  id?: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface RideRequest {
  id?: string;
  pickupLocation: Location;
  destinationLocation: Location;
  rideType: RideType;
  scheduledTime?: string;
  paymentMethod: PaymentMethodType;
  estimatedFare?: number;
  estimatedDistance?: number;
  estimatedDuration?: number;
  notes?: string;
  passengers?: number;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // Full name for display
  phone: string;
  email: string;
  profileImage?: string;
  rating: number;
  totalRides: number;
  licenseNumber: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    type: string;
  };
  // Alias for backward compatibility
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    licensePlate: string;
    type: string;
  };
  currentLocation?: Location;
}

export interface Ride {
  data: any;
  success: boolean;
  message: string;
  _id: any;
  data: any;
  [x: string]: any;
  [x: string]: boolean;
  id: string;
  riderId: string;
  driverId?: string;
  driver: Driver;
  pickupLocation: Location;
  destinationLocation: Location;
  rideType: RideType;
  status: RideStatus;
  fare: FareDetails;
  paymentMethod: PaymentMethodType;
  scheduledTime?: string;
  requestedAt: string;
  acceptedAt?: string;
  driverArrivingAt?: string;
  pickupTime?: string;
  dropoffTime?: string;
  startedAt?: string; // When the ride started
  completedAt?: string; // When the ride was completed
  cancelledAt?: string;
  notes?: string;
  passengers: number;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RideHistory {
  rides: Ride[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    total: number; // Alias for totalItems
    itemsPerPage: number;
  };
  filters: {
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    status?: Ride['status'][];
    fareRange?: {
      min: number;
      max: number;
    };
    searchQuery?: string;
  };
}

export interface FareEstimation {
  id: string;
  rideType: RideType;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeFare: number;
  surgeMultiplier: number;
  taxes: number;
  discount: number;
  total: number;
  distance: number; // in meters
  duration: number; // in minutes
  estimatedTime: string;
  currency: string;
  validUntil: string;
}

export interface FareDetails {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeFare: number;
  discount: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'card' | 'wallet';
  isDefault: boolean;
  nickname?: string; // Display name/nickname for payment method
  cardNumber?: string; // Card number for display
  expiryMonth?: string; // Card expiry month
  expiryYear?: string; // Card expiry year
  details?: {
    cardLast4?: string;
    cardType?: string;
    walletBalance?: number;
  };
}

export interface RiderProfile {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // Full name for display
  email: string;
  phone: string;
  profileImage?: string;
  dateOfBirth?: string;
  totalRides?: number; // Total rides count
  memberSince?: string; // Member since date
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    defaultPaymentMethod: string;
    rideReminders: boolean;
    promotionalEmails: boolean;
    smsNotifications: boolean;
  };
  stats: {
    totalRides: number;
    totalSpent: number;
    averageRating: number;
    favoriteDestinations: Location[];
  };
}

export interface LiveRideTracking {
  rideId: string;
  currentLocation: Location;
  driverLocation: Location;
  estimatedArrival: string | number; // Can be string time or number milliseconds
  routeProgress: number;
  nextInstruction?: string;
  trafficCondition: 'light' | 'moderate' | 'heavy';
  status?: RideStatus; // Current ride status
  driver?: Driver; // Driver information
  vehicle?: {
    make: string;
    model: string;
    licensePlate: string;
  };
  distance?: number; // Distance in meters
}

export interface RideFilter {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  status?: Ride['status'][];
  fareRange?: {
    min: number;
    max: number;
  };
  rideType?: ('economy' | 'premium' | 'luxury')[];
  paymentMethod?: ('cash' | 'card' | 'wallet')[];
}

export interface RideSearchParams {
  page: number;
  limit: number;
  search?: string;
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minFare?: number;
  maxFare?: number;
  filters?: RideFilter;
  sortBy?: 'date' | 'fare' | 'duration' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export type Point = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

export type LocationPoint = {
  address: string;
  coordinates: Point;
};

export interface FareEstimation {
  total: number;
  rideType: string;
  duration: number; // minutes
  distance: number; // meters or km depending on backend (use meters here)
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeFare: number;
  surgeMultiplier: number;
  taxes: number;
  discount: number;
}