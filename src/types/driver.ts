

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
