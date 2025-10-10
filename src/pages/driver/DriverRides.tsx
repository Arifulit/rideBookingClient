import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  useGetRideHistoryQuery,
  useGetActiveRideQuery,
  useUpdateRideStatusMutation,
  useCompleteRideMutation,
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
import { Car, Search, Filter, MoreHorizontal, MapPin, Clock, Calendar, Star, DollarSign, User } from 'lucide-react';

interface Ride {
  id: string;
  riderId: string;
  riderName: string;
  riderRating?: number;
  pickup: string;
  destination: string;
  fare: number;
  // Unified status union including driver-side transient statuses
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

const DriverRides = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Use backend data
  const {
    data: activeRide,
    refetch: refetchActiveRide,
    isLoading: activeLoading,
    isFetching: activeFetching,
    isError: activeError,
    error: activeErrorObj,
  } = useGetActiveRideQuery();

  const {
    data: rideHistory,
    isLoading: historyLoading,
    isFetching: historyFetching,
    isError: historyError,
    error: historyErrorObj,
  } = useGetRideHistoryQuery({ page: 1, limit: 50 });
  const [updateRideStatus] = useUpdateRideStatusMutation();
  const [completeRide] = useCompleteRideMutation();
  const { toast } = useToast();

  
  // Debug logs for backend responses and RTK Query states
  console.log('data active ride', activeRide);
  console.log('active ride states -> loading:', activeLoading, 'fetching:', activeFetching, 'error:', activeError);
  if (activeErrorObj) console.log('active ride error object:', activeErrorObj);

  console.log('data ride history', rideHistory);
  console.log('ride history states -> loading:', historyLoading, 'fetching:', historyFetching, 'error:', historyError);
  if (historyErrorObj) console.log('ride history error object:', historyErrorObj);
  // Build a unified rides array: active ride first, then history
  const rides: Ride[] = [];
  if (activeRide) {
    rides.push({
      id: activeRide.id,
      riderId: activeRide.riderId,
      riderName: `${activeRide.rider.firstName} ${activeRide.rider.lastName}`,
      riderRating: undefined,
      pickup: activeRide.pickupLocation.address,
      destination: activeRide.destinationLocation.address,
      fare: activeRide.fare.total,
      status: activeRide.status as Ride['status'],
      paymentMethod: activeRide.paymentMethod,
      createdAt: activeRide.acceptedAt || new Date().toISOString(),
      completedAt: activeRide.completedAt,
      distance: activeRide.actualDistance ?? 0,
      duration: activeRide.actualDuration ?? 0,
    });
  }
  if (rideHistory && rideHistory.rides) {
    rides.push(
      ...rideHistory.rides.map((r) => ({
        id: r.id,
        riderId: '',
        riderName: `${r.rider.firstName} ${r.rider.lastName}`,
        riderRating: r.rating,
        pickup: r.pickupAddress,
        destination: r.destinationAddress,
        fare: r.fare,
        status: (r.status === 'completed' ? 'completed' : 'cancelled') as Ride['status'],
        paymentMethod: r.paymentMethod,
        createdAt: r.completedAt || new Date().toISOString(),
        completedAt: r.completedAt,
        distance: r.distance,
        duration: r.duration,
      }))
    );
  }

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.riderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ride.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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

  const statsData = {
    total: rides.length,
    completed: rides.filter(r => r.status === 'completed').length,
    active: rides.filter(r => ['accepted', 'picked_up', 'in_transit'].includes(r.status)).length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
    totalEarned: rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.fare || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-600">Manage your driving history and current rides</p>
        </div>
        <Button>
          <Car className="mr-2 h-4 w-4" />
          Go Online
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.completed}</div>
            <p className="text-xs text-muted-foreground">Successful rides</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.active}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <Car className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled rides</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statsData.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed rides</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Ride History</CardTitle>
          <CardDescription>
            View and manage all your driving assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter by Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('in_transit')}>
                  In Transit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('accepted')}>
                  Accepted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('cancelled')}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rides Table */}
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
              {filteredRides.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell className="font-medium">{ride.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{ride.riderName}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {ride.riderRating || 'N/A'}
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
                      {ride.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ride.status === 'cancelled' ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <span className="font-medium">${ride.fare.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentMethodColor(ride.paymentMethod)}>
                      {ride.paymentMethod.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(ride.createdAt).toLocaleTimeString()}
                    </div>
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
                        {ride.status === 'completed' && (
                          <>
                            <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                            <DropdownMenuItem>Rate Rider</DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                          <DropdownMenuItem>Contact Rider</DropdownMenuItem>
                        )}
                        {/* Status transition actions */}
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

                        {/* Cancel action available when ride is active/not completed */}
                        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={async () => {
                              try {
                                // Ask for quick confirmation via window.confirm for now
                                // In UI this should be a modal; keep simple here
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
              ))}
            </TableBody>
          </Table>

          {filteredRides.length === 0 && (
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
                <Button>
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
