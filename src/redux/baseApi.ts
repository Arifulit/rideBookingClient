import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
// import type { RootState } from '../index'

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