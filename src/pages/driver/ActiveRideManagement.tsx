import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageCircle, 
  CheckCircle,
  XCircle,
  Car,
  PlayCircle,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useGetActiveRideQuery,
  useUpdateRideStatusMutation,
  useCancelRideMutation,
  type ActiveRide
} from '@/redux/features/driver/driverApi';
import { updateRideStatus, setActiveRide } from '@/redux/features/driver/driverSlice';
import { RootState } from '@/redux/store';

const ActiveRideManagement = () => {
  const dispatch = useDispatch();
  const { currentLocation } = useSelector((state: RootState) => state.driver);
  const { data: activeRide, isLoading } = useGetActiveRideQuery();
  const [updateStatus] = useUpdateRideStatusMutation();
  const [cancelRide] = useCancelRideMutation();
  
  const [cancelReason, setCancelReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!activeRide) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Active Ride</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Ride</h3>
            <p className="text-muted-foreground text-center">
              You don't have any active rides at the moment.
              <br />
              Accept a ride request to start managing rides.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: ActiveRide['status']) => {
    try {
      setIsUpdatingStatus(true);
      await updateStatus({ 
        rideId: activeRide.id, 
        status: newStatus,
        location: currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        } : undefined
      }).unwrap();
      
      dispatch(updateRideStatus({ 
        status: newStatus, 
        timestamp: new Date().toISOString() 
      }));
      
      if (['completed', 'cancelled'].includes(newStatus)) {
        dispatch(setActiveRide(null));
      }
      
      toast.success(`Ride status updated to ${newStatus.replace('-', ' ')}`);
    } catch {
      toast.error('Failed to update ride status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelRide = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      await cancelRide({ 
        rideId: activeRide.id, 
        status: 'cancelled'
      }).unwrap();
      
      dispatch(setActiveRide(null));
      toast.success('Ride has been cancelled');
    } catch {
      toast.error('Failed to cancel ride');
    }
  };

  const getNextStatus = (currentStatus: ActiveRide['status']): ActiveRide['status'] | null => {
    const statusFlow: Record<ActiveRide['status'], ActiveRide['status'] | null> = {
      'accepted': 'driver-arriving',
      'driver-arriving': 'driver-arrived',
      'driver-arrived': 'in-progress',
      'in-progress': 'completed',
      'completed': null,
      'cancelled': null,
    };
    
    return statusFlow[currentStatus] || null;
  };

  const getStatusColor = (status: ActiveRide['status']) => {
    const colors = {
      'accepted': 'bg-blue-500',
      'driver-arriving': 'bg-yellow-500',
      'driver-arrived': 'bg-orange-500',
      'in-progress': 'bg-green-500',
      'completed': 'bg-gray-500',
      'cancelled': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status: ActiveRide['status']) => {
    const texts = {
      'accepted': 'Ride Accepted',
      'driver-arriving': 'Arriving at Pickup',
      'driver-arrived': 'Arrived at Pickup',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return texts[status] || status;
  };

  const nextStatus = getNextStatus(activeRide.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Ride</h1>
        <Badge className={getStatusColor(activeRide.status)}>
          {getStatusText(activeRide.status)}
        </Badge>
      </div>

      {/* Rider Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={activeRide.rider.profileImage} alt={activeRide.rider.firstName} />
              <AvatarFallback>
                {activeRide.rider.firstName[0]}{activeRide.rider.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {activeRide.rider.firstName} {activeRide.rider.lastName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {activeRide.rideType.charAt(0).toUpperCase() + activeRide.rideType.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {activeRide.id.slice(-6)}
                </span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call Rider
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trip Route */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Pickup Location */}
            <motion.div 
              className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                ['accepted', 'driver-arriving'].includes(activeRide.status) 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-green-500 bg-green-50 dark:bg-green-900/20'
              }`}
              animate={{ scale: ['accepted', 'driver-arriving'].includes(activeRide.status) ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 2, repeat: ['accepted', 'driver-arriving'].includes(activeRide.status) ? Infinity : 0 }}
            >
              <div className={`w-4 h-4 rounded-full ${
                ['accepted', 'driver-arriving'].includes(activeRide.status) ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {['accepted', 'driver-arriving'].includes(activeRide.status) ? 'Pickup Location' : 'Picked up from'}
                </p>
                <p className="font-medium">{activeRide.pickupLocation.address}</p>
              </div>
              <Button variant="ghost" size="sm">
                <Navigation className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Route Line */}
            <div className="ml-8 border-l-2 border-dashed border-gray-300 h-8" />

            {/* Destination Location */}
            <motion.div 
              className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                activeRide.status === 'in-progress'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : activeRide.status === 'completed'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
              }`}
              animate={{ scale: activeRide.status === 'in-progress' ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 2, repeat: activeRide.status === 'in-progress' ? Infinity : 0 }}
            >
              <div className={`w-4 h-4 rounded-full ${
                activeRide.status === 'completed' ? 'bg-green-500' : 
                activeRide.status === 'in-progress' ? 'bg-orange-500' : 'bg-gray-400'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {activeRide.status === 'completed' ? 'Dropped off at' : 'Destination'}
                </p>
                <p className="font-medium">{activeRide.destinationLocation.address}</p>
              </div>
              {activeRide.status === 'in-progress' && (
                <Button variant="ghost" size="sm">
                  <Navigation className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details & Fare */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <Badge variant="outline">
                  {activeRide.paymentMethod.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started At</span>
                <span>{new Date(activeRide.acceptedAt).toLocaleTimeString()}</span>
              </div>
              {activeRide.startedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trip Started</span>
                  <span>{new Date(activeRide.startedAt).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fare Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Fare</span>
                <span>${activeRide.fare.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance Fare</span>
                <span>${activeRide.fare.distanceFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Fare</span>
                <span>${activeRide.fare.timeFare.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-green-600">${activeRide.fare.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {activeRide.status !== 'completed' && activeRide.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {/* Cancel Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 border-red-500 text-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Ride
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Ride</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel this ride? Please provide a reason.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Enter cancellation reason..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button
                          onClick={handleCancelRide}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirm Cancellation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Next Status Button */}
                  {nextStatus && (
                    <Button
                      onClick={() => handleStatusUpdate(nextStatus)}
                      disabled={isUpdatingStatus}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Timer className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          {nextStatus === 'driver-arriving' && <Car className="h-4 w-4 mr-2" />}
                          {nextStatus === 'driver-arrived' && <MapPin className="h-4 w-4 mr-2" />}
                          {nextStatus === 'in-progress' && <PlayCircle className="h-4 w-4 mr-2" />}
                          {nextStatus === 'completed' && <CheckCircle className="h-4 w-4 mr-2" />}
                          {getStatusText(nextStatus)}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveRideManagement;