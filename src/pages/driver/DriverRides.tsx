
import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  useGetRideHistoryQuery,
  useGetActiveRideQuery,
  useUpdateRideStatusMutation,
  useCompleteRideMutation,
  useGetRideRequestsQuery,
} from '@/redux/features/driver/driverApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Car,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Clock,
  Calendar,
  Star,
  DollarSign,
  User,
  Loader2,
} from 'lucide-react';

interface Ride {
  id: string;
  riderId: string;
  riderName: string;
  riderRating?: number;
  pickup: string;
  destination: string;
  fare: number;
  status:
    | 'pending'
    | 'accepted'
    | 'picked_up'
    | 'in_transit'
    | 'completed'
    | 'cancelled'
    | 'driver-arriving'
    | 'driver-arrived'
    | 'in-progress';
  paymentMethod: 'cash' | 'card' | 'wallet';
  createdAt: string;
  completedAt?: string;
  distance: number;
  duration: number;
}

const DriverRides = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isOnline, setIsOnline] = useState(false);

  const { data: activeRide, refetch: refetchActiveRide, isLoading: activeLoading } = useGetActiveRideQuery();
  const { data: rideHistory, isLoading: historyLoading } = useGetRideHistoryQuery({ page: 1, limit: 50 });
  const {
    data: rideRequestsData,
    isLoading: requestsLoading,
    isFetching: requestsFetching,
    isError: requestsError,
    error: requestsErrorObj,
    refetch: refetchRequests,
  } = useGetRideRequestsQuery({ showAll: true } as { showAll?: boolean });

  const [updateRideStatus] = useUpdateRideStatusMutation();
  const [completeRide] = useCompleteRideMutation();
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Dev-only direct fetch debug to inspect raw backend response
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('tokens');
    (async () => {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = String(token).replace(/^Bearer\s+/i, '');
        const resp = await fetch('http://localhost:5000/api/v1/driver/rides/requests?showAll=true', {
          method: 'GET',
          headers,
          credentials: 'include',
        });
        let body: unknown = null;
        try { body = await resp.json(); } catch { body = await resp.text(); }
        console.debug('directFetch -> status:', resp.status, 'ok:', resp.ok);
        console.debug('directFetch -> headers:', Array.from(resp.headers.entries()));
        console.debug('directFetch -> body:', body);
      } catch (err) {
        console.debug('directFetch -> failed', err);
      }
    })();
  }, []);

  // rate-limit retry handling
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [retryTimerActive, setRetryTimerActive] = useState(false);

  useEffect(() => {
    if (!requestsErrorObj) return;
    const errObj = requestsErrorObj as Record<string, unknown> | undefined;
    const status = (errObj && typeof errObj['status'] === 'number') ? (errObj['status'] as number) : undefined;
    const headers = (errObj && (errObj['data'] as Record<string, unknown>)?.headers) as Record<string, string> | undefined
      || (errObj && (errObj['headers'] as Record<string, unknown>) as Record<string, string> | undefined)
      || undefined;
    const retryHeader = headers ? (headers['retry-after'] ?? headers['Retry-After'] ?? headers['retry_after']) : undefined;
    if (status === 429) {
      const seconds = retryHeader ? parseInt(String(retryHeader), 10) : 60;
      setRetryAfterSeconds(Number.isFinite(seconds) && seconds > 0 ? seconds : 60);
      setRetryTimerActive(true);
    }
  }, [requestsErrorObj]);

  useEffect(() => {
    if (!retryTimerActive || retryAfterSeconds === null) return;
    const interval = setInterval(() => {
      setRetryAfterSeconds((s) => {
        if (s === null) return null;
        if (s <= 1) {
          clearInterval(interval);
          setRetryTimerActive(false);
          try { refetchRequests(); } catch { /* ignore */ }
          return null;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryTimerActive, retryAfterSeconds, refetchRequests]);

  const rides: Ride[] = useMemo(() => {
    const list: Ride[] = [];

    if (activeRide) {
      list.push({
        id: (activeRide.id ?? activeRide._id ?? String(Math.random())) as string,
        riderId: activeRide.riderId ?? (activeRide.rider?._id ?? ''),
        riderName: `${activeRide.rider?.firstName ?? 'Unknown'} ${activeRide.rider?.lastName ?? ''}`.trim(),
        riderRating: undefined,
        pickup: activeRide.pickupLocation?.address ?? activeRide.pickupAddress ?? 'Unknown pickup',
        destination: activeRide.destinationLocation?.address ?? activeRide.destinationAddress ?? 'Unknown destination',
        fare: activeRide.fare?.total ?? 0,
        status: (activeRide.status as Ride['status']) ?? 'in-progress',
        paymentMethod: (activeRide.paymentMethod ?? 'card') as Ride['paymentMethod'],
        createdAt: activeRide.acceptedAt ?? (activeRide.createdAt ?? new Date().toISOString()),
        completedAt: activeRide.completedAt,
        distance: activeRide.actualDistance ?? activeRide.estimatedDistance ?? 0,
        duration: activeRide.actualDuration ?? activeRide.estimatedDuration ?? 0,
      });
    }

    if (rideHistory && Array.isArray((rideHistory as any).rides)) {
      list.push(
        ...(rideHistory as any).rides.map((r: any) => ({
          id: r.id ?? r._id,
          riderId: r.rider?._id ?? '',
          riderName: `${r.rider?.firstName ?? 'Unknown'} ${r.rider?.lastName ?? ''}`.trim(),
          riderRating: r.rating,
          pickup: r.pickupAddress ?? 'Unknown pickup',
          destination: r.destinationAddress ?? 'Unknown destination',
          fare: r.fare ?? 0,
          status: (r.status === 'completed' ? 'completed' : 'cancelled') as Ride['status'],
          paymentMethod: (r.paymentMethod ?? 'card') as Ride['paymentMethod'],
          createdAt: r.completedAt ?? r.createdAt ?? new Date().toISOString(),
          completedAt: r.completedAt,
          distance: r.distance ?? 0,
          duration: r.duration ?? 0,
        }))
      );
    }

    if (rideRequestsData) {
      let items: Array<Record<string, unknown>> = [];
      if (Array.isArray(rideRequestsData)) items = rideRequestsData as any;
      else if (rideRequestsData && typeof rideRequestsData === 'object') {
        const maybe = rideRequestsData as Record<string, unknown>;
        if (Array.isArray(maybe.data)) items = maybe.data as any;
        else if (Array.isArray(maybe.requests)) items = maybe.requests as any;
        else {
          const firstArray = Object.values(maybe).find((v) => Array.isArray(v));
          if (Array.isArray(firstArray)) items = firstArray as any;
        }
      }

      if (items.length > 0) {
        const mapStatus = (s?: string) => {
          if (!s) return 'pending';
          if (s === 'requested') return 'pending';
          if (s === 'rejected') return 'cancelled';
          return s as Ride['status'];
        };

        const requestsAsRides: Ride[] = items.map((rr) => {
          const riderObj = (rr['riderId'] as any) || (rr['rider'] as any) || {};
          const fareObj = rr['fare'] as any;
          const distanceObj = rr['distance'] as any;
          const durationObj = rr['duration'] as any;

          const estimatedFare = fareObj?.estimated;
          const actualFare = fareObj?.actual;

          const idVal = (rr['_id'] as string) ?? (rr['id'] as string) ?? String(Math.random());
          let riderIdVal = '';
          if (typeof rr['riderId'] === 'string') riderIdVal = rr['riderId'] as string;
          else if (riderObj && typeof riderObj['_id'] === 'string') riderIdVal = riderObj['_id'];

          const pickupVal = (rr['pickupLocation'] && (rr['pickupLocation'] as any).address) ?? rr['pickupLocation'] ?? 'Unknown pickup';
          const destinationVal = (rr['destination'] && (rr['destination'] as any).address) ?? rr['destination'] ?? 'Unknown destination';
          const fareVal = Number(estimatedFare ?? actualFare ?? rr['estimatedFare'] ?? 0);
          const createdVal = (rr['timeline'] && ((rr['timeline'] as any).requested)) ?? rr['requestedAt'] ?? rr['createdAt'] ?? new Date().toISOString();
          const completedVal = (rr['timeline'] && ((rr['timeline'] as any).completed)) ?? rr['completedAt'];
          const distanceVal = (distanceObj?.estimated) ?? rr['estimatedDistance'] ?? 0;
          const durationVal = (durationObj?.estimated) ?? rr['estimatedDuration'] ?? 0;

          return {
            id: idVal,
            riderId: riderIdVal,
            riderName: `${riderObj?.firstName ?? riderObj?.firstname ?? 'Unknown'} ${riderObj?.lastName ?? riderObj?.lastname ?? ''}`.trim(),
            riderRating: riderObj?.rating ?? undefined,
            pickup: pickupVal,
            destination: destinationVal,
            fare: fareVal,
            status: mapStatus(rr['status'] as string | undefined),
            paymentMethod: (rr['paymentMethod'] as string | undefined ?? 'cash') as Ride['paymentMethod'],
            createdAt: createdVal,
            completedAt: completedVal,
            distance: distanceVal,
            duration: durationVal,
          } as Ride;
        });

        return requestsAsRides;
      }
    }

    return list;
  }, [activeRide, rideHistory, rideRequestsData]);

  const filteredRides = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return rides.filter((ride) => {
      const matchesSearch =
        (String(ride.id ?? '').toLowerCase().includes(term)) ||
        (String(ride.riderName ?? '').toLowerCase().includes(term)) ||
        (String(ride.pickup ?? '').toLowerCase().includes(term)) ||
        (String(ride.destination ?? '').toLowerCase().includes(term));
      const matchesStatus = selectedStatus === 'all' || ride.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [rides, debouncedSearch, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'driver-arriving': return 'bg-yellow-100 text-yellow-800';
      case 'driver-arrived': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'cash': return 'bg-green-100 text-green-800';
      case 'wallet': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statsData = useMemo(() => ({
    total: rides.length,
    completed: rides.filter(r => r.status === 'completed').length,
    active: rides.filter(r => ['accepted', 'picked_up', 'in_transit', 'in-progress'].includes(r.status)).length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
    totalEarned: rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.fare || 0), 0),
  }), [rides]);

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString() : '-';
  const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString() : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-600">Manage your driving history and current rides</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant={isOnline ? 'ghost' : 'default'} onClick={() => setIsOnline(v => !v)}>
            <Car className="mr-2 h-4 w-4" />
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </div>
            <CardTitle className="text-sm font-medium">{statsData.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </div>
            <CardTitle className="text-sm font-medium">{statsData.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Successful rides</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </div>
            <CardTitle className="text-sm font-medium">{statsData.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">In progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-red-600" />
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            </div>
            <CardTitle className="text-sm font-medium">{statsData.cancelled}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Cancelled rides</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            </div>
            <CardTitle className="text-sm font-medium">${statsData.totalEarned.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">From completed rides</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rides by ID, rider, pickup or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedStatus === 'all' ? 'Filter by Status' : selectedStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Statuses</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSelectedStatus('all')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('completed')}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('in_transit')}>In Transit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('accepted')}>Accepted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('cancelled')}>Cancelled</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" onClick={() => { refetchRequests(); refetchActiveRide(); }}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refresh
              </Button>
            </div>
          </div>

          <CardDescription className="mt-2">View and manage driving assignments — requests (if any) are shown above history</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4 text-xs text-gray-500">
            Status: {requestsLoading || requestsFetching ? 'loading' : requestsError ? 'error' : 'idle'}
            {requestsErrorObj && <span className="ml-4 text-red-600">Error: {(requestsErrorObj as any)?.message ?? 'See console'}</span>}
          </div>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ride ID</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                { (requestsLoading || activeLoading || historyLoading) && filteredRides.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                      <TableCell className="animate-pulse bg-gray-100 h-6" />
                    </TableRow>
                  ))
                ) : (
                  filteredRides.map((ride) => (
                    <TableRow key={ride.id}>
                      <TableCell className="font-medium">{ride.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{ride.riderName}</div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              {ride.riderRating ?? 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-xs">
                          <div className="flex items-start text-sm">
                            <MapPin className="mr-1 h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{ride.pickup}</span>
                          </div>
                          <div className="flex items-start text-sm">
                            <MapPin className="mr-1 h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{ride.destination}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            {ride.distance}km • {ride.duration > 0 ? `${ride.duration}min` : 'TBD'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ride.status)}>
                          {String(ride.status ?? '').replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ride.status === 'cancelled' ? <span className="text-gray-400">-</span> : <span className="font-medium">${ride.fare.toFixed(2)}</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(ride.paymentMethod)}>
                          {String(ride.paymentMethod ?? '').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                          {formatDate(ride.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">{formatTime(ride.createdAt)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            {ride.status === 'completed' && <>
                              <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                              <DropdownMenuItem>Rate Rider</DropdownMenuItem>
                            </>}
                            <DropdownMenuSeparator />
                            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                              <DropdownMenuItem>Contact Rider</DropdownMenuItem>
                            )}
                            {(ride.status === 'accepted' || ride.status === 'driver-arriving') && (
                              <DropdownMenuItem
                                className="text-blue-600"
                                onClick={async () => {
                                  try {
                                    await updateRideStatus({ rideId: ride.id, status: 'driver-arrived' }).unwrap();
                                    toast({ title: 'Marked arrived', description: 'Driver has arrived at pickup.' });
                                    refetchActiveRide();
                                  } catch {
                                    toast({ title: 'Error', description: 'Could not mark arrived', variant: 'destructive' });
                                  }
                                }}
                              >
                                Mark Arrived
                              </DropdownMenuItem>
                            )}
                            {ride.status === 'driver-arrived' && (
                              <DropdownMenuItem
                                className="text-purple-600"
                                onClick={async () => {
                                  try {
                                    await updateRideStatus({ rideId: ride.id, status: 'in-progress' }).unwrap();
                                    toast({ title: 'Picked up', description: 'Ride is now in progress.' });
                                    refetchActiveRide();
                                  } catch {
                                    toast({ title: 'Error', description: 'Could not start trip', variant: 'destructive' });
                                  }
                                }}
                              >
                                Pick Up Rider
                              </DropdownMenuItem>
                            )}
                            {(ride.status === 'in_transit' || ride.status === 'in-progress') && (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={async () => {
                                  try {
                                    await completeRide({ rideId: ride.id, finalLocation: { latitude: 0, longitude: 0 } }).unwrap();
                                    toast({ title: 'Ride completed', description: 'Ride marked as completed.' });
                                    refetchActiveRide();
                                  } catch {
                                    toast({ title: 'Error', description: 'Could not complete ride', variant: 'destructive' });
                                  }
                                }}
                              >
                                Complete Ride
                              </DropdownMenuItem>
                            )}
                            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={async () => {
                                  try {
                                    if (!confirm('Are you sure you want to cancel this ride?')) return;
                                    await updateRideStatus({ rideId: ride.id, status: 'cancelled' }).unwrap();
                                    toast({ title: 'Ride cancelled', description: 'Ride has been cancelled.' });
                                    refetchActiveRide();
                                  } catch {
                                    toast({ title: 'Error', description: 'Could not cancel ride', variant: 'destructive' });
                                  }
                                }}
                              >
                                Cancel Ride
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Report Issue</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredRides.length === 0 && !(requestsLoading || activeLoading || historyLoading) && (
            <div className="text-center py-8 text-gray-500">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : "No rides available. Go online to start accepting rides!"
                }
              </p>
              {!searchTerm && selectedStatus === 'all' && (
                <Button onClick={() => setIsOnline(true)}>
                  <Car className="mr-2 h-4 w-4" />
                  Go Online Now
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverRides;
