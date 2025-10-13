/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { updateAvailabilityStatus } from '@/redux/features/driver/driverSlice';
import { apiConfig } from '@/config/env';
import {
  useGetRideHistoryQuery,
  useGetActiveRideQuery,
  useUpdateRideStatusMutation,
  useCompleteRideMutation,
  useGetRideRequestsQuery,
  useUpdateDriverOnlineStatusMutation,
} from '@/redux/features/driver/driverApi';

// module-scoped map to hold delayed action timers (keyed by ride id)
const delayedActionTimersMap: Record<string, number> = {};
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'picked_up'
  | 'in_transit'
  | 'completed'
  | 'cancelled';
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

  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((s) => s.driver.isOnline);

  const { data: activeRide, refetch: refetchActiveRide, isLoading: activeLoading } = useGetActiveRideQuery();
  const { data: rideHistory, isLoading: historyLoading } = useGetRideHistoryQuery({ page: 1, limit: 50 });
  const {
    data: rideRequestsData,
    isLoading: requestsLoading,
    isFetching: requestsFetching,
    isError: requestsError,
    error: requestsErrorObj,
    refetch: refetchRequests,
  } = useGetRideRequestsQuery(
    { showAll: true } as { showAll?: boolean },
    {
      // Poll for new requests every 5 seconds so drivers see incoming ride requests quickly
      pollingInterval: 5000,
      // Helpful for mobile/desktop re-focus or network reconnects
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const [updateRideStatus, { isLoading: updatingStatus }] = useUpdateRideStatusMutation();
  const [completeRide, { isLoading: completingRide }] = useCompleteRideMutation();
  const [updateOnlineStatus, { isLoading: updatingOnline }] = useUpdateDriverOnlineStatusMutation();
  
  // use Sonner global toast for immediate notifications
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
  // timers for delayed server-side actions (e.g., undoable cancel)
  // using a module-scoped map so timers persist across renders
  // (defined below as `delayedActionTimersMap`)
  

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
        const base = (apiConfig?.baseURL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1').replace(/\/$/, '');
        const resp = await fetch(`${base}/driver/rides/requests?showAll=true`, {
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

  // Helper to set online status (optimistic update + backend sync)
  const setOnline = async (val: boolean) => {
    const prev = isOnline;
    try {
      // optimistic update
      dispatch(updateAvailabilityStatus({ isOnline: val }));
      const res = await updateOnlineStatus(val).unwrap();
      sonnerToast.success(`${res?.message ?? 'Status updated'} — ${val ? 'You are now online' : 'You are now offline'}`);
    } catch (err) {
      console.error('updateOnlineStatus failed', err);
      // revert
      dispatch(updateAvailabilityStatus({ isOnline: prev }));
      sonnerToast.error('Could not update status — Please try again');
    }
  };

  const toggleOnline = async () => {
    await setOnline(!isOnline);
  };

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
      const ar = activeRide as any;
      list.push({
        id: (ar.id ?? ar._id ?? String(Math.random())) as string,
        riderId: ar.riderId ?? (ar.rider?._id ?? ''),
        riderName: `${ar.rider?.firstName ?? 'Unknown'} ${ar.rider?.lastName ?? ''}`.trim(),
        riderRating: undefined,
        pickup: ar.pickupLocation?.address ?? ar.pickupAddress ?? 'Unknown pickup',
        destination: ar.destinationLocation?.address ?? ar.destinationAddress ?? 'Unknown destination',
        fare: ar.fare?.total ?? 0,
        status: (ar.status as Ride['status']) ?? 'accepted',
        paymentMethod: (ar.paymentMethod ?? 'card') as Ride['paymentMethod'],
        createdAt: ar.acceptedAt ?? (ar.createdAt ?? new Date().toISOString()),
        completedAt: ar.completedAt,
        distance: ar.actualDistance ?? ar.estimatedDistance ?? 0,
        duration: ar.actualDuration ?? ar.estimatedDuration ?? 0,
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
          // requests from rider without explicit status should be 'requested'
          if (!s) return 'requested';
          const raw = String(s);
          // normalize snake_case -> hyphen for UI friendliness, map known aliases
          const snake = raw.replace(/-/g, '_');
          if (snake === 'requested') return 'requested';
          if (snake === 'rejected') return 'rejected';
          // keep original form (some backends return snake_case, some hyphenated)
          return raw as Ride['status'];
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

  // Helper to normalize a status string to snake_case for comparisons with backend enums
  const normalizeStatus = (s?: string) => (s ? String(s).replace(/-/g, '_') : '');

  const formatStatusLabel = (s?: string) => {
    if (!s) return '';
    // Convert snake_case or hyphen-case to Title Case
    const parts = String(s).replace(/_/g, ' ').replace(/-/g, ' ').split(' ');
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  // Show a non-blocking confirmation toast using Sonner and return true if user confirms.
  type ConfirmVariant = 'default' | 'success' | 'error';
  // Show a non-blocking confirmation toast using Sonner and return true if user confirms.
  // variant: 'success' -> green, 'error' -> red
  const showConfirmToast = (message: string, actionLabel = 'Confirm', duration = 8000, variant: ConfirmVariant = 'default'): Promise<boolean> => {
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        // auto-cancel after duration
        resolve(false);
      }, duration);

      const renderToast = () => {
        if (variant === 'success') {
          sonnerToast.success(message, {
            description: '',
            action: {
              label: actionLabel,
              onClick: () => {
                clearTimeout(timer);
                resolve(true);
              },
            },
            duration,
          });
        } else if (variant === 'error') {
          sonnerToast.error(message, {
            description: '',
            action: {
              label: actionLabel,
              onClick: () => {
                clearTimeout(timer);
                resolve(true);
              },
            },
            duration,
          });
        } else {
          sonnerToast(message, {
            description: '',
            action: {
              label: actionLabel,
              onClick: () => {
                clearTimeout(timer);
                resolve(true);
              },
            },
            duration,
          });
        }
      };

      renderToast();
    });
  };

  // Full allowed statuses (UI uses hyphenated forms to match Ride type); driverApi will normalize to snake_case before sending.
  const ALL_STATUSES: Ride['status'][] = [
    'requested',
    'accepted',
    'rejected',
    'picked_up',
    'in_transit',
    'completed',
    'cancelled',
  ];

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
      case 'requested': return 'bg-indigo-100 text-indigo-800';
      case 'driver-arriving': return 'bg-yellow-100 text-yellow-800';
      case 'driver-arrived': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
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
    active: rides.filter(r => ['accepted', 'picked_up', 'in_transit'].includes(r.status)).length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
    totalEarned: rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.fare || 0), 0),
    // exclude cancelled rides from total fares
    totalFare: rides.reduce((sum, r) => {
      if (r.status === 'cancelled') return sum;
      return sum + (Number.isFinite(Number(r.fare)) ? Number(r.fare) : 0);
    }, 0),
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
          <Button variant={isOnline ? 'ghost' : 'default'} onClick={toggleOnline} disabled={updatingOnline}>
            <Car className="mr-2 h-4 w-4" />
            {updatingOnline ? (isOnline ? 'Going Offline...' : 'Going Online...') : (isOnline ? 'Go Offline' : 'Go Online')}
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
              <div className="text-right">
                <CardTitle className="text-sm font-medium">${statsData.totalFare.toFixed(2)}</CardTitle>
                <div className="text-xs text-muted-foreground">Total fares (all rides)</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Completed earnings: ${statsData.totalEarned.toFixed(2)}</div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rides by rider, pickup or destination..."
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
        </CardHeader>

        <CardContent>
          <div className="mb-4 text-xs text-gray-500">
            Status: {requestsLoading || requestsFetching ? 'loading' : requestsError ? 'error' : 'idle'}
            {Boolean(requestsErrorObj) && <span className="ml-4 text-red-600">Error: {String((requestsErrorObj as any)?.message ?? 'See console')}</span>}
          </div>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                {(requestsLoading || activeLoading || historyLoading) && filteredRides.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2">
                              <Badge className={getStatusColor(optimisticStatuses[ride.id] ?? ride.status)}>
                                {formatStatusLabel(optimisticStatuses[ride.id] ?? ride.status)}
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            {/* If ride was a request, the Accept/Reject options are shown in the Actions menu below. */}

                            {/* Accepted: Cancel */}
                            {normalizeStatus(ride.status) === 'accepted' && (
                              <>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={async () => {
                                    if (updatingStatus) return;
                                    // optimistic UI update
                                    setOptimisticStatuses((s) => ({ ...s, [ride.id]: 'cancelled' }));

                                    // show an undoable toast and delay the server request
                                    const DELAY_MS = 6000; // 6s to allow undo
                                    const timerId = window.setTimeout(async () => {
                                      try {
                                        await updateRideStatus({ rideId: ride.id, status: 'cancelled' }).unwrap();
                                        sonnerToast.success('Ride cancelled — Ride has been cancelled.');
                                        try { refetchActiveRide(); } catch { /* ignore */ }
                                      } catch (err) {
                                        console.error('updateRideStatus(cancel) failed', err);
                                        sonnerToast.error('Error — Could not cancel ride');
                                        // revert optimistic on failure
                                        setOptimisticStatuses((s) => { const c = { ...s }; delete c[ride.id]; return c; });
                                        } finally {
                                        delete delayedActionTimersMap[ride.id];
                                      }
                                    }, DELAY_MS);

                                    delayedActionTimersMap[ride.id] = timerId;

                                    sonnerToast(`Ride will be cancelled`, {
                                      description: 'You can undo this action within a few seconds.',
                                      action: {
                                        label: 'Undo',
                                        onClick: () => {
                                          // cancel pending timer and revert optimistic status
                                          const t = delayedActionTimersMap[ride.id];
                                          if (t) {
                                            clearTimeout(t);
                                            delete delayedActionTimersMap[ride.id];
                                          }
                                          setOptimisticStatuses((s) => { const c = { ...s }; delete c[ride.id]; return c; });
                                          sonnerToast.success('Undo — Ride cancellation aborted.');
                                        },
                                      },
                                      duration: 6000,
                                    });
                                  }}
                                  disabled={updatingStatus}
                                >
                                  {updatingStatus ? 'Processing...' : 'Cancel Ride'}
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* In-progress / In-transit: Complete */}
                            {(normalizeStatus(ride.status) === 'in_transit') && (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={async () => {
                                  if (completingRide) return;
                                  // optimistic
                                  setOptimisticStatuses((s) => ({ ...s, [ride.id]: 'completed' }));
                                  try {
                                    await completeRide({ rideId: ride.id, finalLocation: { latitude: 0, longitude: 0 } }).unwrap();
                                    sonnerToast.success('Ride completed — Ride marked as completed.');
                                    refetchActiveRide();
                                  } catch {
                                    sonnerToast.error('Error — Could not complete ride');
                                  } finally {
                                    setOptimisticStatuses((s) => { const c = { ...s }; delete c[ride.id]; return c; });
                                  }
                                }}
                                disabled={completingRide}
                              >
                                {completingRide ? 'Completing...' : 'Complete Ride'}
                              </DropdownMenuItem>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
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
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRide(ride);
                                setDetailsOpen(true);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            {/* Accept/Reject handled from requests list when applicable. */}
                            {ride.status === 'completed' && <>
                              <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                              <DropdownMenuItem>Rate Rider</DropdownMenuItem>
                            </>}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>All statuses</DropdownMenuLabel>
                            {/* If this is a request, allow Accept/Reject here too */}
                            {ride.status === 'requested' && (
                              <>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    if (updatingStatus) return;
                                    try {
                                      await updateRideStatus({ rideId: ride.id, status: 'accepted' as any }).unwrap();
                                      sonnerToast.success('Ride accepted.');
                                      refetchRequests();
                                      refetchActiveRide();
                                    } catch (err) {
                                      console.error('accept request failed', err);
                                      sonnerToast.error('Could not accept request');
                                    }
                                  }}
                                  disabled={updatingStatus}
                                >
                                  Accept Request
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={async () => {
                                    if (updatingStatus) return;
                                    try {
                                      await updateRideStatus({ rideId: ride.id, status: 'rejected' as any }).unwrap();
                                      sonnerToast.success('Request rejected.');
                                      refetchRequests();
                                    } catch (err) {
                                      console.error('reject request failed', err);
                                      sonnerToast.error('Could not reject request');
                                    }
                                  }}
                                  disabled={updatingStatus}
                                >
                                  Reject Request
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {ALL_STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={async () => {
                                  if (updatingStatus) return;
                                  try {
                                    // Ask user to confirm via a professional toast instead of blocking confirm()
                                    if (s === 'completed') {
                                      const ok = await showConfirmToast('Mark this ride as completed?', 'Confirm', 8000, 'success');
                                      if (!ok) return;
                                    }
                                    if (s === 'cancelled') {
                                      const ok = await showConfirmToast('Cancel this ride?', 'Confirm', 8000, 'error');
                                      if (!ok) return;
                                    }
                                    // cast to any to satisfy backend payload typing (driverApi normalizes string to snake_case)
                                    await updateRideStatus({ rideId: ride.id, status: s as any }).unwrap();
                                    sonnerToast.success(`Status updated — ${formatStatusLabel(s)} applied.`);
                                    refetchActiveRide();
                                  } catch (err) {
                                    console.error('updateRideStatus failed', err);
                                    sonnerToast.error(`Error — Could not set status to ${formatStatusLabel(s)}`);
                                  }
                                }}
                                disabled={updatingStatus}
                              >
                                {formatStatusLabel(s)}
                              </DropdownMenuItem>
                            ))}
                            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                              <DropdownMenuItem>Contact Rider</DropdownMenuItem>
                            )}
                            {/* removed driver-arriving/driver-arrived specific actions per request */}
                            {(normalizeStatus(ride.status) === 'in_transit') && (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={async () => {
                                  if (completingRide) return;
                                  try {
                                    await completeRide({ rideId: ride.id, finalLocation: { latitude: 0, longitude: 0 } }).unwrap();
                                    sonnerToast.success('Ride completed — Ride marked as completed.');
                                    refetchActiveRide();
                                  } catch {
                                    sonnerToast.error('Error — Could not complete ride');
                                  }
                                }}
                                disabled={completingRide}
                              >
                                {completingRide ? 'Completing...' : 'Complete Ride'}
                              </DropdownMenuItem>
                            )}
                            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={async () => {
                                  if (updatingStatus) return;
                                  // optimistic update
                                  setOptimisticStatuses((s) => ({ ...s, [ride.id]: 'cancelled' }));

                                  const DELAY_MS = 6000;
                                  const timerId = window.setTimeout(async () => {
                                    try {
                                      await updateRideStatus({ rideId: ride.id, status: 'cancelled' }).unwrap();
                                      sonnerToast.success('Ride cancelled — Ride has been cancelled.');
                                      try { refetchActiveRide(); } catch { /* ignore */ }
                                    } catch (err) {
                                      console.error('updateRideStatus(cancel) failed', err);
                                      sonnerToast.error('Error — Could not cancel ride');
                                      setOptimisticStatuses((s) => { const c = { ...s }; delete c[ride.id]; return c; });
                                    } finally {
                                      delete delayedActionTimersMap[ride.id];
                                    }
                                    }, DELAY_MS);

                                  delayedActionTimersMap[ride.id] = timerId;

                                  sonnerToast(`Ride will be cancelled`, {
                                    description: 'You can undo this action within a few seconds.',
                                    action: {
                                      label: 'Undo',
                                      onClick: () => {
                                        const t = delayedActionTimersMap[ride.id];
                                        if (t) {
                                          clearTimeout(t);
                                          delete delayedActionTimersMap[ride.id];
                                        }
                                        setOptimisticStatuses((s) => { const c = { ...s }; delete c[ride.id]; return c; });
                                        sonnerToast.success('Undo — Ride cancellation aborted.');
                                      },
                                    },
                                    duration: 6000,
                                  });
                                }}
                                disabled={updatingStatus}
                              >
                                {updatingStatus ? 'Processing...' : 'Cancel Ride'}
                              </DropdownMenuItem>
                            )}
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
                <Button onClick={() => setOnline(true)} disabled={updatingOnline}>
                  <Car className="mr-2 h-4 w-4" />
                  {updatingOnline ? 'Updating...' : 'Go Online Now'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Ride Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>Information about the selected ride</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRide ? (
              <div>
                <div className="flex justify-between">
                  <div className="font-medium">Rider</div>
                  <div>{selectedRide.riderName}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Pickup</div>
                  <div className="text-right">{selectedRide.pickup}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Destination</div>
                  <div className="text-right">{selectedRide.destination}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Fare</div>
                  <div>${selectedRide.fare.toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Status</div>
                  <div className={getStatusColor(selectedRide.status)}>{selectedRide.status}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Distance</div>
                  <div>{selectedRide.distance} km</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Duration</div>
                  <div>{selectedRide.duration ? `${selectedRide.duration} min` : 'TBD'}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Requested</div>
                  <div>{formatDate(selectedRide.createdAt)} {formatTime(selectedRide.createdAt)}</div>
                </div>
              </div>
            ) : (
              <div>No ride selected</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverRides;
