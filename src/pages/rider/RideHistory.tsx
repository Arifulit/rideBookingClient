/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  DollarSign,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useGetRideHistoryQuery } from '@/redux/features/rider/riderApi';
import type { RideSearchParams } from '@/types/rider';

interface RideHistoryProps {
  className?: string;
}

// Extended Ride interface to handle all possible data structures
interface Location {
  address: string;
  coordinates?: {
    type: string;
    coordinates: [number, number];
  };
  latitude?: number;
  longitude?: number;
}

interface Driver {
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface Ride {
  id?: string;
  _id?: string;
  status: 'pending' | 'ongoing' | 'accepted' | 'completed' | 'cancelled' | 'driver-arriving' | 'in-progress';
  pickup?: string;
  pickupLocation?: Location;
  destination?: string;
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
  driver?: Driver;
  rideType?: string;
}

interface RideHistoryData {
  rides: Ride[];
  total?: number;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
  accepted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Accepted' },
  'driver-arriving': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Driver Arriving' },
  'in-progress': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'In Progress' },
  ongoing: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Ongoing' },
  completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' },
} as const;

export function RideHistory({ className = '' }: RideHistoryProps) {
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useState<RideSearchParams>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    dateFrom: '',
    dateTo: '',
    minFare: undefined,
    maxFare: undefined,
  });

  const { 
    data: rideHistoryData, 
    isLoading, 
    error,
    refetch
  } = useGetRideHistoryQuery(searchParams);

  // Helper functions
  const getFareAmount = (fare?: number | any): number => {
    if (typeof fare === 'number') return fare;
    if (fare && typeof fare === 'object') {
      return fare.total ?? fare.amount ?? fare.base ?? 0;
    }
    return 0;
  };

  const getLocationAddress = (primary?: string, locationObj?: Location): string => {
    if (primary) return primary;
    if (locationObj?.address) return locationObj.address;
    return 'Unknown location';
  };

  const getDriverName = (driver?: Driver): string => {
    if (!driver) return '';
    if (driver.name) return driver.name;
    if (driver.firstName && driver.lastName) {
      return `${driver.firstName} ${driver.lastName}`;
    }
    if (driver.firstName) return driver.firstName;
    return '';
  };

  const getRideId = (ride: Ride): string => {
    return ride.id ?? ride._id ?? '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return 'Invalid date';
    }
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof RideSearchParams, value: string | number | undefined) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      page: 1,
      limit: 10,
      search: '',
      status: undefined,
      dateFrom: '',
      dateTo: '',
      minFare: undefined,
      maxFare: undefined,
    });
  };

  if (error) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Rides</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading your ride history.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedData = rideHistoryData as RideHistoryData | undefined;
  const rides = typedData?.rides ?? [];
  const totalRides = typedData?.total ?? typedData?.pagination?.total ?? rides.length;
  const totalPages = typedData?.pagination?.totalPages ?? Math.ceil(totalRides / searchParams.limit);

  return (
    <motion.div 
      className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ride History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your past rides
          </p>
        </div>
        
        <Button 
          onClick={() => refetch()} 
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location..."
                  value={searchParams.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select
                value={searchParams.status || ''}
                onValueChange={(value) => 
                  handleFilterChange('status', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Input
                type="date"
                value={searchParams.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Input
                type="date"
                value={searchParams.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          {/* Fare Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Min Fare ($)</label>
              <Input
                type="number"
                placeholder="0"
                value={searchParams.minFare || ''}
                onChange={(e) => 
                  handleFilterChange('minFare', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Max Fare ($)</label>
              <Input
                type="number"
                placeholder="1000"
                value={searchParams.maxFare || ''}
                onChange={(e) => 
                  handleFilterChange('maxFare', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ride List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="glass">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rides.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Rides Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchParams.search || searchParams.status 
                ? 'No rides match your search criteria.' 
                : 'You haven\'t taken any rides yet.'
              }
            </p>
            {(searchParams.search || searchParams.status) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {rides.map((ride: Ride, index: number) => {
              const statusInfo = statusConfig[ride.status] ?? statusConfig.pending;
              const rideId = getRideId(ride);
              const pickupAddress = getLocationAddress(ride.pickup, ride.pickupLocation);
              const destinationAddress = getLocationAddress(ride.destination, ride.destinationLocation);
              const fareAmount = getFareAmount(ride.fare);
              const driverName = getDriverName(ride.driver);
              const rideDate = ride.createdAt ?? ride.date;
              
              return (
                <motion.div
                  key={rideId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    className="glass hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(`/rider/rides/${rideId}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        
                        {/* Route Indicator */}
                        <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-red-500 rounded-full"></div>
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        </div>

                        {/* Ride Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {pickupAddress}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                to {destinationAddress}
                              </p>
                            </div>
                            
                            <Badge className={`ml-2 ${statusInfo.color}`}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            {rideDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(rideDate)}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatCurrency(fareAmount)}
                            </div>
                            
                            {driverName && (
                              <div className="flex items-center gap-1">
                                <span>{driverName}</span>
                                {ride.rating && ride.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{ride.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {ride.rideType && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {ride.rideType.charAt(0).toUpperCase() + ride.rideType.slice(1)}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(searchParams.page - 1)}
                disabled={searchParams.page <= 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground px-4">
                Page {searchParams.page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(searchParams.page + 1)}
                disabled={searchParams.page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Summary */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {rides.length} of {totalRides} rides
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default RideHistory;