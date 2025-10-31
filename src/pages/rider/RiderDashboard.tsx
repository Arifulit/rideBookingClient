/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Car,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  useGetRiderProfileQuery,
  useGetRideHistoryQuery,
  useGetRideDetailsQuery,
} from '@/redux/features/rider/riderApi';

// Comprehensive Types
interface Location {
  address?: string;
  coordinates?: {
    type: string;
    coordinates: [number, number];
  } | [number, number];
  latitude?: number;
  longitude?: number;
}

interface Ride {
  id?: string;
  _id?: string;
  status: 'pending' | 'ongoing' | 'accepted' | 'completed' | 'cancelled' | 'driver-arriving' | 'in-progress';
  pickup?: string | Location;
  pickupLocation?: Location;
  destination?: string | Location;
  destinationLocation?: Location;
  fare?: number | {
    base?: number;
    distance?: number;
    time?: number;
    surge?: number;
    total?: number;
    amount?: number;
  };
  rating?: number;
  createdAt?: string;
  date?: string;
  driver?: {
    id?: string;
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  rideType?: string;
}

interface RiderProfile {
  rider?: { 
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  user?: { 
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface RideHistory {
  rides?: Ride[];
  total?: number;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}


function formatLocationValue(val?: string | Location): string {
  if (!val && val !== '') return 'Unknown location';

  // plain string
  if (typeof val === 'string') {
    const s = val.trim();
    return s === '' ? 'Unknown location' : s;
  }

  // object
  const obj: any = val;
  // address field
  if (obj.address && typeof obj.address === 'string' && obj.address.trim() !== '') {
    return obj.address;
  }

  // latitude/longitude fields
  if (typeof obj.latitude === 'number' && typeof obj.longitude === 'number') {
    return `${Number(obj.latitude).toFixed(6)}, ${Number(obj.longitude).toFixed(6)}`;
  }

  // coordinates as array [lon, lat] or coordinates.coordinates
  const coordsCandidate = obj.coordinates ?? obj.location ?? null;
  if (Array.isArray(coordsCandidate) && coordsCandidate.length >= 2) {
    const lon = Number(coordsCandidate[0]);
    const lat = Number(coordsCandidate[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  }

  // If object uses GeoJSON style: { coordinates: [lon, lat] } inside coordinates property
  if (obj.coordinates && Array.isArray(obj.coordinates.coordinates) && obj.coordinates.coordinates.length >= 2) {
    const lon = Number(obj.coordinates.coordinates[0]);
    const lat = Number(obj.coordinates.coordinates[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  }

  return 'Unknown location';
}

export default function RiderDashboard() {
  const navigate = useNavigate();

  // Fetch profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetRiderProfileQuery();

  // Fetch ride history with higher limit to get all rides for stats
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useGetRideHistoryQuery({ page: 1, limit: 100 });

  // Type the history data
  const typedHistory = history as RideHistory | undefined;
  const allRides = typedHistory?.rides ?? [];

  // Find active ride (ongoing, accepted, driver-arriving, or in-progress)
  const activeRideItem = allRides.find((r) =>
    ['ongoing', 'accepted', 'driver-arriving', 'in-progress'].includes(String(r.status))
  );

  const activeRideId = activeRideItem?.id ?? activeRideItem?._id;

  // Fetch active ride details if exists
  const {
    data: activeRide,
    isFetching: activeFetching,
  } = useGetRideDetailsQuery(activeRideId ?? '', {
    skip: !activeRideId,
    pollingInterval: activeRideId ? 5000 : 0, // Poll every 5s if active ride exists
  });

  // Helper to extract fare amount from various formats
  const getFareAmount = (fare?: number | any): number => {
    if (typeof fare === 'number') return fare;
    if (fare && typeof fare === 'object') {
      return fare.total ?? fare.amount ?? fare.base ?? 0;
    }
    return 0;
  };

  // Helper to get user name from profile
  const getUserName = (profileData?: RiderProfile): string => {
    if (!profileData) return 'Rider';
    
    const riderObj = profileData.rider ?? profileData.user ?? profileData;
    
    // Try name field first
    if (riderObj.name) return riderObj.name;
    
    // Try firstName + lastName
    if (riderObj.firstName) {
      return riderObj.lastName 
        ? `${riderObj.firstName} ${riderObj.lastName}`
        : riderObj.firstName;
    }
    
    return 'Rider';
  };

  // Calculate statistics from all rides
  const completedRides = allRides.filter((r) => r.status === 'completed') ?? [];
  const totalRides = completedRides.length;
  
  const totalSpent = completedRides.reduce((sum, r) => {
    return sum + getFareAmount(r.fare);
  }, 0);
  
  const ridesWithRatings = completedRides.filter(r => r.rating && r.rating > 0);
  const avgRating = ridesWithRatings.length > 0
    ? ridesWithRatings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ridesWithRatings.length
    : 0;

  // Loading state
  if (profileLoading || historyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError || historyError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Unable to Load Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading your information. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userName = getUserName(profile as RiderProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-lg text-gray-600">
              Your personalized ride dashboard
            </p>
          </div>

          <button
            onClick={() => navigate('/rider/book-ride')}
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Book a Ride</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Car className="h-8 w-8 text-white" />}
            label="Total Rides"
            value={totalRides}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<DollarSign className="h-8 w-8 text-white" />}
            label="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={<TrendingUp className="h-8 w-8 text-white" />}
            label="Avg Rating"
            value={avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
            gradient="from-purple-500 to-indigo-600"
          />
          <StatCard
            icon={<Clock className="h-8 w-8 text-white" />}
            label="Active Rides"
            value={activeRide ? 1 : 0}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Active Ride */}
        {activeFetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : activeRide ? (
          <ActiveRideCard ride={activeRide as Ride} navigate={navigate} getFareAmount={getFareAmount} />
        ) : null}

        {/* Recent Rides */}
        <RecentRidesSection rides={completedRides.slice(0, 5)} navigate={navigate} getFareAmount={getFareAmount} />
      </div>
    </div>
  );
}

/* ────────────────────── Reusable Components ────────────────────── */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}

function StatCard({ icon, label, value, gradient }: StatCardProps) {
  return (
    <div
      className={`group relative bg-gradient-to-br ${gradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">{icon}</div>
          <div className="text-right">
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-white/90 font-medium text-sm">{label}</p>
          </div>
        </div>
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 rounded-full w-3/4 transition-all duration-500" />
        </div>
      </div>
    </div>
  );
}

interface ActiveRideCardProps {
  ride: Ride;
  navigate: ReturnType<typeof useNavigate>;
  getFareAmount: (fare?: number | any) => number;
}

function ActiveRideCard({ ride, navigate, getFareAmount }: ActiveRideCardProps) {
  const getLocationText = (primary?: string | Location, locationObj?: Location): string => {
    // prefer primary (string or object)
    const primaryText = formatLocationValue(primary);
    if (primaryText !== 'Unknown location') return primaryText;

    // fallback to location object
    return formatLocationValue(locationObj);
  };

  const rideId = ride.id ?? ride._id ?? '';

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'accepted': 'Driver Accepted',
      'driver-arriving': 'Driver Arriving',
      'in-progress': 'In Progress',
      'ongoing': 'Ongoing',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
      <div className="relative p-8 text-white">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-2xl font-bold flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Car className="h-6 w-6" />
            </div>
            <span>Active Ride</span>
          </h3>
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">{getStatusDisplay(ride.status)}</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-white/70 mb-1">Pickup</p>
                    <p className="font-medium break-words">
                      {getLocationText(ride.pickup, ride.pickupLocation)}
                    </p>
                  </div>
                </div>
                <div className="w-px h-6 bg-white/30 ml-1" />
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-white/70 mb-1">Destination</p>
                    <p className="font-medium break-words">
                      {getLocationText(ride.destination, ride.destinationLocation)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${getFareAmount(ride.fare).toFixed(2)}</p>
              <p className="text-white/70 text-sm">Estimated fare</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/rider/rides/${rideId}`)}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-3 rounded-xl transition-all duration-300"
        >
          View Ride Details
        </button>
      </div>
    </div>
  );
}

interface RecentRidesSectionProps {
  rides: Ride[];
  navigate: ReturnType<typeof useNavigate>;
  getFareAmount: (fare?: number | any) => number;
}

function RecentRidesSection({ rides, navigate, getFareAmount }: RecentRidesSectionProps) {
  const getRideId = (ride: Ride): string => ride.id ?? ride._id ?? '';

  const getLocationText = (primary?: string | Location, locationObj?: Location): string => {
    const primaryText = formatLocationValue(primary);
    if (primaryText !== 'Unknown location') return primaryText;
    return formatLocationValue(locationObj);
  };

  const getRideDate = (ride: Ride): string => {
    const dateStr = ride.createdAt ?? ride.date;
    if (!dateStr) return 'Unknown date';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <span>Recent Rides</span>
        </h3>
      </div>

      <div className="p-8">
        <div className="space-y-4">
          {rides.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No rides yet</p>
              <p className="text-gray-400 mb-6">Start your journey by booking your first ride</p>
              <button
                onClick={() => navigate('/rider/book-ride')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                <Car className="h-5 w-5" />
                <span>Book Your First Ride</span>
              </button>
            </div>
          ) : (
            rides.map((ride) => {
              const rideId = getRideId(ride);
              return (
                <div
                  key={rideId || Math.random()}
                  className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate(`/rider/rides/${rideId}`)}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-[250px]">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-sm truncate">
                              {getLocationText(ride.pickup, ride.pickupLocation)}
                            </span>
                          </div>
                          <div className="text-gray-400 flex-shrink-0">→</div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-sm truncate">
                              {getLocationText(ride.destination, ride.destinationLocation)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{getRideDate(ride)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-gray-800 mb-1">
                        ${getFareAmount(ride.fare).toFixed(2)}
                      </p>
                      {ride.rating && ride.rating > 0 ? (
                        <div className="flex items-center justify-end space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < ride.rating! ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Not rated</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {rides.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/rider/rides')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
            >
              <span>View All Rides</span>
              <TrendingUp className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}