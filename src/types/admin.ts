/* eslint-disable @typescript-eslint/no-explicit-any */
// Types for admin API
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

export interface User {
  id: string;
  _id?: string;
  // Backend এ firstName, lastName আলাদা field আছে
  firstName: string;
  lastName: string;
  name?: string; // Computed field for display
  fullName?: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  contactNumber?: string;
  role: 'rider' | 'driver' | 'admin';
  // Backend এ isActive field আছে
  isActive: 'active' | 'inactive' | 'suspended';
  status?: 'active' | 'blocked' | 'suspended' | 'pending'; // For compatibility
  isBlocked: boolean;
  emailVerified: boolean;
  lastLogin?: string | null;
  profileImage?: string;
  avatar?: string;
  profilePicture?: string | null;
  password?: string; // Backend এ আছে কিন্তু UI তে show করব না
  auths?: any[]; // Backend এ আছে
  createdAt: string;
  updatedAt: string;
  __v?: number; // MongoDB version field
  
  // Rider specific fields
  totalRides?: number;
  ridesCount?: number;
  totalSpent?: number;
  amountSpent?: number;
  averageRating?: number;
  
  // Driver specific fields
  completedRides?: number;
  driverRating?: number;
  rating?: number;
  totalEarnings?: number;
  earnings?: number;
  vehicleInfo?: {
    model: string;
    licensePlate: string;
    color: string;
  };
}

export interface AdminRideOverview {
  id: string;
  _id?: string;
  rideId?: string;
  rider: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  driver: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    vehicle?: {
      model: string;
      licensePlate: string;
    };
  };
  pickup: {
    address: string;
    coordinates: [number, number];
  };
  destination: {
    address: string;
    coordinates: [number, number];
  };
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  fare: number;
  distance: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalRiders: number;
  totalDrivers: number;
  totalRides: number;
  completedRides: number;
  totalRevenue: number;
  averageRating: number;
  activeDrivers: number;
  growth: {
    drivers: number;
    users: number;
    rides: number;
    revenue: number;
  };
}

export interface DriverActivityData {
  driverId: string;
  driverName: string;
  ridesCompleted: number;
  totalEarnings: number;
  averageRating: number;
  status: 'active' | 'inactive';
  lastActive: string;
}

export interface ChartData {
  label: string;
  value: number;
  date?: string;
  period?: string;
}

export interface UserSearchParams {
  search?: string;
  role?: 'all' | 'rider' | 'driver';
  status?: 'all' | 'active' | 'blocked' | 'suspended';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RideSearchParams {
  search?: string;
  status?: string;
  driverId?: string;
  riderId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsParams {
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

export interface UserActionRequest {
  userId: string;
  reason?: string;
}

export interface RideActionRequest {
  rideId: string;
  status: string;
  reason?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
  total: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}