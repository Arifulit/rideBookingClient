/**
 * Example usage of the enhanced axios configuration
 * 
 * This file demonstrates how to use the axios instance and API request utilities
 * with proper TypeScript types and error handling.
 */

import axiosInstance, { apiRequest } from './axios';
import type { ApiResponse, AuthResponse, LoginRequest, User, Ride, PaginatedResponse } from '@/types/api';

// Example 1: Using the basic axios instance
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  return response.data.data;
};

// Example 2: Using the utility functions with proper types
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiRequest.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
};

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await apiRequest.put<ApiResponse<User>>(`/users/${userId}`, userData);
  return response.data.data;
};

// Example 3: Working with paginated data
export const getUserRides = async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Ride>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/rides${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiRequest.get<ApiResponse<PaginatedResponse<Ride>>>(url);
  return response.data.data;
};

// Example 4: File upload with proper content type
export const uploadAvatar = async (userId: string, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axiosInstance.post<ApiResponse<User>>(`/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

// Example 5: Request with custom timeout
export const longRunningRequest = async (data: unknown): Promise<unknown> => {
  const response = await axiosInstance.post('/long-process', data, {
    timeout: 30000, // 30 seconds timeout for this specific request
  });
  
  return response.data;
};

// Example 6: Cancel requests using AbortController
export const cancelableRequest = async (signal?: AbortSignal): Promise<User[]> => {
  const response = await axiosInstance.get<ApiResponse<User[]>>('/users', {
    signal, // Pass the abort signal to cancel the request
  });
  
  return response.data.data;
};

// Usage example for cancelable request:
// const controller = new AbortController();
// const promise = cancelableRequest(controller.signal);
// 
// // Cancel the request after 5 seconds
// setTimeout(() => controller.abort(), 5000);
// 
// try {
//   const users = await promise;
//   console.log(users);
// } catch (error) {
//   if (error.name === 'AbortError') {
//     console.log('Request was cancelled');
//   }
// }