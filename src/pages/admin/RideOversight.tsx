/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { 
  Route, 
  Search, 
  Download,
  MoreHorizontal,
  Eye,
  Ban,
  RefreshCw,
  CheckCircle,
  Clock,
  DollarSign,
  Car,
  Calendar,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// RTK Query hooks
import { 
  useGetAdminRidesQuery,
  useUpdateRideStatusMutation,
  useGetDriverRideRequestsQuery,
} from '@/redux/features/admin/adminApi';
import { RideSearchParams } from '@/types/admin';

interface AdminRideOverview {
  [key: string]: any;
  id?: string;
  rideId?: string;
  riderId?: string;
  riderName?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  pickupAddress?: string | null;
  destinationAddress?: string | null;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  fare?: number | { estimated?: number } | any;
  distance?: number | { estimated?: number } | any;
  duration?: number | { estimated?: number } | any;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  issues?: any[];
  riderRating?: number | null;
  driverRating?: number | null;
}

interface RideOversightProps {
  className?: string;
}

export function RideOversight({ className = '' }: RideOversightProps) {
  const [searchParams, setSearchParams] = useState<RideSearchParams & { query?: string; paymentStatus?: string; dateFrom?: string; dateTo?: string; hasIssues?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({
    query: '',
    status: 'all',
    paymentStatus: 'all',
    dateFrom: '',
    dateTo: '',
    hasIssues: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });


  const [selectedRide, setSelectedRide] = useState<AdminRideOverview | null>(null);
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [actionRide, setActionRide] = useState<{
    ride: AdminRideOverview;
    action: string;
  } | null>(null);

  // Admin rides (existing admin API)
  const { data: ridesResponse, isLoading: adminLoading } = useGetAdminRidesQuery(searchParams);
  const [updateRideStatus] = useUpdateRideStatusMutation();

  // Driver service requests (new endpoint)
  const { data: driverReqData, isLoading: driverReqLoading } = useGetDriverRideRequestsQuery({ showAll: true });

  const loading = adminLoading || driverReqLoading;

  // helper to map driver request shape to AdminRideOverview expected by UI
  const mapDriverRequest = (req: any): AdminRideOverview => {
    const rider = req.riderId ?? {};
    const pickup = req.pickupLocation ?? {};
    const dest = req.destination ?? {};
    const coordsToAddr = (loc: any) => {
      if (!loc) return '';
      if (typeof loc === 'string') return loc;
      if (loc.address) return loc.address;
      if (loc.coordinates && Array.isArray(loc.coordinates.coordinates)) {
        return `${loc.coordinates.coordinates[1]}, ${loc.coordinates.coordinates[0]}`;
      }
      return '';
    };
    return {
      id: req._id,
      rideId: req._id,
      riderId: rider._id ?? rider.id ?? '',
      riderName: `${(rider.firstName ?? '').trim()} ${(rider.lastName ?? '').trim()}`.trim() || (rider.email ?? 'Rider'),
      driverId: req.driverId ?? null,
      driverName: null,
      pickupAddress: coordsToAddr(pickup),
      destinationAddress: coordsToAddr(dest),
      status: req.status ?? 'pending',
      paymentMethod: req.paymentMethod ?? 'cash',
      paymentStatus: req.paymentStatus ?? 'pending',
      fare: typeof req.fare === 'object' ? (req.fare.estimated ?? 0) : (req.fare ?? 0),
      distance: typeof req.distance === 'object' ? (req.distance.estimated ?? 0) : (req.distance ?? 0),
      duration: typeof req.duration === 'object' ? (req.duration.estimated ?? 0) : (req.duration ?? 0),
      createdAt: req.createdAt ?? req.timeline?.requested ?? '',
      updatedAt: req.updatedAt ?? '',
      issues: req.issues ?? [],
      riderRating: req.rating?.riderRating ?? null,
      driverRating: req.rating?.driverRating ?? null,
    } as unknown as AdminRideOverview;
  };

  const apiRides = (ridesResponse?.data ?? []) as AdminRideOverview[];
  const mappedDriverRequests = Array.isArray(driverReqData) ? driverReqData.map(mapDriverRequest) : [];

  // prefer showing driver requests when available; otherwise show admin API rides
  const rides = mappedDriverRequests.length > 0 ? mappedDriverRequests : apiRides;

  // pagination: prefer admin pagination when using admin API; otherwise synthesize
  const pagination = ridesResponse?.pagination ?? (mappedDriverRequests.length > 0 ? { total: mappedDriverRequests.length, page: 1, pages: 1 } : undefined);

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
  };

  const handleFilterChange = (key: keyof RideSearchParams, value: string | boolean) => {
    setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleRideAction = async (action: string) => {
    if (!actionRide) return;

    // Ensure we have a defined rideId (some sources use id, others rideId)
    const rideId = actionRide.ride.id ?? actionRide.ride.rideId;
    if (!rideId) {
      toast.error('Unable to perform action: missing ride ID');
      setActionRide(null);
      return;
    }

    try {
      await updateRideStatus({
        rideId: rideId,
        action: action,
        reason: `Admin ${action} action`,
        refundAmount: action === 'refund' ? actionRide.ride.fare : undefined,
      }).unwrap();
      
      toast.success(`Ride ${action}ed successfully`);
      setActionRide(null);
    } catch {
      toast.error(`Failed to ${action} ride`);
    }
  };

  // Export visible rides as CSV and trigger download
  const handleExport = () => {
    const headers = [
      'Ride ID',
      'Created At',
      'Rider Name',
      'Rider ID',
      'Driver Name',
      'Driver ID',
      'Pickup Address',
      'Destination Address',
      'Status',
      'Payment Method',
      'Payment Status',
      'Fare',
      'Distance',
      'Duration'
    ];

    const rows = rides.map(r => ([
      r.rideId ?? r.id ?? '',
      r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
      r.riderName ?? '',
      r.riderId ?? '',
      r.driverName ?? '',
      r.driverId ?? '',
      r.pickupAddress ?? '',
      r.destinationAddress ?? '',
      r.status ?? '',
      r.paymentMethod ?? '',
      r.paymentStatus ?? '',
      typeof r.fare === 'number' ? r.fare : Number(r.fare || 0),
      typeof r.distance === 'number' ? r.distance : Number(r.distance || 0),
      typeof r.duration === 'number' ? r.duration : String(r.duration || '')
    ]));

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const fname = `rides-export-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.csv`;
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
      accepted: { className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      'in-progress': { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
      completed: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' },
      cancelled: { className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      pending: { className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' },
      completed: { className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      failed: { className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
      refunded: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${className}`}>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`p-6 space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Route className="h-8 w-8" />
            Ride Oversight
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all rides with advanced filtering and actions
          </p>
        </div>

        <Button 
          onClick={handleExport}
          className="btn-primary"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Rides
        </Button>
      </div>

      {/* Stats Cards (issues card removed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rides.length}</div>
            <p className="text-xs text-muted-foreground">
              All time rides
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rides.filter(r => ['pending', 'accepted', 'in-progress'].includes(r.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rides.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful rides
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters (issues filter removed) */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search rides by ID, rider, or driver..."
                value={searchParams.query || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={searchParams.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select
              value={searchParams.paymentStatus || 'all'}
              onValueChange={(value) => handleFilterChange('paymentStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select
              value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="fare-desc">Highest Fare</SelectItem>
                <SelectItem value="fare-asc">Lowest Fare</SelectItem>
                <SelectItem value="distance-desc">Longest Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rides Table (issues column removed) */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rides ({pagination?.total ?? rides.length})</span>
            <Badge variant="outline" className="text-xs">
              Page {pagination?.page || 1} of {pagination?.pages || 1}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ride Details</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              <AnimatePresence>
                {rides.map((ride) => (
                  <motion.tr
                    key={ride.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{ride.rideId}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(ride.createdAt).toLocaleDateString()}
                          {ride.completedAt && (
                            <span className="text-xs">
                              • {formatDuration(ride.duration)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="font-medium">${Number(ride.fare || 0).toFixed(2)}</span>
                          <span className="text-muted-foreground">• {Number(ride.distance || 0).toFixed(1)} km</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        {/* Rider */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {String(ride.riderName || '').split(' ').map((n: string) => n[0] || '').join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{ride.riderName}</p>
                            <p className="text-xs text-muted-foreground">Rider</p>
                          </div>
                        </div>
                        
                        {/* Driver */}
                        {ride.driverName ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {String(ride.driverName).split(' ').map((n: string) => n[0] || '').join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{ride.driverName}</p>
                              <p className="text-xs text-muted-foreground">Driver</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center">
                              <Car className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">No driver assigned</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        <div className="flex items-start gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">
                            {ride.pickupAddress}
                          </p>
                        </div>
                        <div className="flex items-start gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">
                            {ride.destinationAddress}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={getStatusBadge(ride.status).className}
                      >
                        {String(ride.status).replace('-', ' ').replace(/\b\w/g, l => String(l).toUpperCase())}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant="outline"
                          className={getPaymentStatusBadge(ride.paymentStatus).className}
                        >
                          {String(ride.paymentStatus || 'pending').charAt(0).toUpperCase() + String(ride.paymentStatus || 'pending').slice(1)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{ride.paymentMethod}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRide(ride);
                              setShowRideDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {ride.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => setActionRide({ ride, action: 'cancel' })}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Cancel Ride
                            </DropdownMenuItem>
                          )}

                          {ride.paymentStatus === 'completed' && (
                            <DropdownMenuItem
                              onClick={() => setActionRide({ ride, action: 'refund' })}
                              className="text-blue-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ride Details Dialog (issues details removed) */}
      <Dialog open={showRideDetails} onOpenChange={setShowRideDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Ride Details - {selectedRide?.rideId}
            </DialogTitle>
          </DialogHeader>

          {selectedRide && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Status and Payment */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Ride Status</h4>
                  <Badge 
                    className={getStatusBadge(selectedRide.status).className}
                  >
                    {String(selectedRide.status).replace('-', ' ').replace(/\b\w/g, l => String(l).toUpperCase())}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Status</h4>
                  <Badge 
                    className={getPaymentStatusBadge(selectedRide.paymentStatus).className}
                  >
                    {String(selectedRide.paymentStatus || 'pending').charAt(0).toUpperCase() + String(selectedRide.paymentStatus || 'pending').slice(1)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Participants */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Rider Information</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {String(selectedRide.riderName || '').split(' ').map((n: string) => n[0] || '').join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedRide.riderName}</p>
                      <p className="text-sm text-muted-foreground">ID: {selectedRide.riderId}</p>
                      {selectedRide.riderRating && (
                        <p className="text-sm">Rating: {selectedRide.riderRating}/5 ⭐</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Driver Information</h4>
                  {selectedRide.driverName ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {String(selectedRide.driverName).split(' ').map((n: string) => n[0] || '').join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedRide.driverName}</p>
                        <p className="text-sm text-muted-foreground">ID: {selectedRide.driverId}</p>
                        {selectedRide.driverRating && (
                          <p className="text-sm">Rating: {selectedRide.driverRating}/5 ⭐</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                        <Car className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">No driver assigned</p>
                        <p className="text-sm text-muted-foreground">Ride was cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Route Information */}
              <div className="space-y-3">
                <h4 className="font-medium">Route Information</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">{selectedRide.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Destination</p>
                      <p className="text-sm text-muted-foreground">{selectedRide.destinationAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Trip Details */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">${Number(selectedRide.fare || 0).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Fare</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{Number(selectedRide.distance || 0).toFixed(1)} km</p>
                  <p className="text-sm text-muted-foreground">Distance</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{formatDuration(selectedRide.duration)}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog 
        open={!!actionRide} 
        onOpenChange={() => setActionRide(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {actionRide?.action.replace('-', ' ').replace(/\b\w/g, l => String(l).toUpperCase())}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionRide?.action.replace('-', ' ')} ride {actionRide?.ride.rideId}?
              {actionRide?.action === 'cancel' && ' This will cancel the ride and notify both parties.'}
              {actionRide?.action === 'refund' && ' This will process a full refund to the rider.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRideAction(actionRide?.action || '')}
            >
              Confirm {actionRide?.action.replace('-', ' ').replace(/\b\w/g, l => String(l).toUpperCase())}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export default RideOversight;