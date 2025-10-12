import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
// import type { RootState } from '../index';

// Alternative baseQuery for future use
// const baseQuery = fetchBaseQuery({
//   baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
//   prepareHeaders: (headers, { getState }) => {
//     const token = (getState() as any).auth.token;
//     if (token) {
//       // Use Authorization header without Bearer prefix
//       headers.set('Authorization', `${token}`);
//     }
//     return headers;
//   },
// });


export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'User', 
    'Ride', 
    'Driver', 
    'DriverProfile', 
    'IncomingRequests', 
    'RideRequests',
    'RidersList',
    'ActiveRide', 
    'RideHistory', 
    'Earnings', 
    'Analytics'
  ],
  endpoints: () => ({}),
});