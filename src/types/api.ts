/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  docs: T[];
  totalDocs?: number;
  limit?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

/* common domain types used by axios-examples.ts */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}

export interface User {
  id: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

export interface Ride {
  id: string;
  pickupLocation?: any;
  destination?: any;
  createdAt?: string;
  [key: string]: any;
}