
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
  Star,
  AlertCircle,
  Shield,
  Route
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { 
  useGetLiveRideTrackingQuery,
  useCancelRideRequestMutation,
  useGetRideDetailsQuery 
} from '@/redux/features/rider/riderApi';

interface LiveRideTrackingProps {
  className?: string;
}

export function LiveRideTracking({ className = '' }: LiveRideTrackingProps) {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const { 
    data: liveTracking, 
    isLoading: trackingLoading, 
    error: trackingError 
  } = useGetLiveRideTrackingQuery(rideId || '', {
    skip: !rideId,
    pollingInterval: 5000, // Poll every 5 seconds
  });
  
  const { 
    data: rideDetails, 
    isLoading: detailsLoading 
  } = useGetRideDetailsQuery(rideId || '', {
    skip: !rideId,
  });
  
  const [cancelRide, { isLoading: canceling }] = useCancelRideRequestMutation();

  const handleCancelRide = async () => {
    if (!rideId) return;
    
    try {
      await cancelRide({ 
        rideId, 
        reason: 'Cancelled by rider' 
      }).unwrap();
      
      toast.success('Ride cancelled successfully');
      navigate('/rider/rides');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } })?.data?.message || 'Failed to cancel ride'
        : 'Failed to cancel ride';
      toast.error(errorMessage);
    }
  };

  const handleCallDriver = () => {
    if (liveTracking?.driver?.phone) {
      window.open(`tel:${liveTracking.driver.phone}`, '_self');
    } else {
      toast.error('Driver phone number not available');
    }
  };

  const handleMessageDriver = () => {
    // Navigate to messaging interface
    toast.info('Messaging feature coming soon');
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'driver-arriving': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'driver-arrived': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'in-progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested': return 'Ride Requested';
      case 'accepted': return 'Driver Assigned';
      case 'driver-arriving': return 'Driver En Route';
      case 'driver-arrived': return 'Driver Arrived';
      case 'in-progress': return 'Ride in Progress';
      case 'completed': return 'Ride Completed';
      case 'cancelled': return 'Ride Cancelled';
      default: return 'Unknown Status';
    }
  };

  if (trackingLoading || detailsLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (trackingError || !liveTracking || !rideDetails) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <Card className="text-center p-8">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Unable to Load Ride Tracking</h3>
              <p className="text-muted-foreground">
                We couldn't load the live tracking information for this ride.
              </p>
            </div>
            <Button onClick={() => navigate('/rider/rides')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rides
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/rider/rides')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>
            <p className="text-muted-foreground">Ride ID: {rideId}</p>
          </div>
        </div>

        <Badge 
          className={`text-sm px-3 py-1 ${getStatusColor(liveTracking.status)}`}
          variant="secondary"
        >
          {getStatusText(liveTracking.status)}
        </Badge>
      </div>

      {/* Live Map (Placeholder) */}
      <Card className="glass">
        <CardContent className="p-0">
          <div className="relative h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Route className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Live Map View</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time driver location and route
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mock route line */}
            <svg 
              className="absolute inset-0 w-full h-full opacity-30" 
              viewBox="0 0 400 200"
            >
              <path
                d="M50,150 Q200,50 350,100"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-primary"
                strokeDasharray="10,5"
              />
              {/* Pickup point */}
              <circle cx="50" cy="150" r="8" className="fill-green-500" />
              {/* Destination point */}
              <circle cx="350" cy="100" r="8" className="fill-red-500" />
              {/* Current driver position */}
              <circle cx="200" cy="80" r="6" className="fill-blue-500">
                <animate 
                  attributeName="r" 
                  values="6;8;6" 
                  dur="2s" 
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Driver Information */}
        <Card className="glass">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Driver</h3>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{liveTracking.driver?.rating || '4.8'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={liveTracking.driver?.profileImage} 
                  alt={liveTracking.driver?.name} 
                />
                <AvatarFallback>
                  {liveTracking.driver?.name?.split(' ').map((n: string) => n[0]).join('') || 'D'}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 flex-1">
                <h4 className="font-semibold text-foreground">
                  {liveTracking.driver?.name || 'Driver Name'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {liveTracking.vehicle?.make} {liveTracking.vehicle?.model}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {liveTracking.vehicle?.licensePlate}
                </p>
              </div>
            </div>

            <Separator />

            {/* Driver Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handleCallDriver}
                className="flex-1 btn-primary"
                size="sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button 
                onClick={handleMessageDriver}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>

            {/* Safety Info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Your safety is our priority</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ride Information */}
        <Card className="glass">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Ride Details</h3>

            <div className="space-y-4">
              {/* Pickup Location */}
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pickup</p>
                  <p className="text-sm text-muted-foreground">
                    {rideDetails.pickupLocation?.address}
                  </p>
                </div>
              </div>

              {/* Destination Location */}
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Destination</p>
                  <p className="text-sm text-muted-foreground">
                    {rideDetails.destinationLocation?.address}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Trip Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  {liveTracking.estimatedArrival ? 
                    `${Math.ceil(liveTracking.estimatedArrival / 60)} min` : 
                    'Calculating...'
                  }
                </p>
                <p className="text-xs text-muted-foreground">ETA</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  {liveTracking.distance ? 
                    `${(liveTracking.distance / 1000).toFixed(1)} km` : 
                    'Calculating...'
                  }
                </p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
            </div>

            <Separator />

            {/* Ride Actions */}
            <AnimatePresence>
              {(liveTracking.status === 'requested' || 
                liveTracking.status === 'accepted' || 
                liveTracking.status === 'driver-arriving') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    onClick={handleCancelRide}
                    disabled={canceling}
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                  >
                    {canceling ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                        Cancelling...
                      </div>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Cancel Ride
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Status */}
      <Card className="glass">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ride Progress</h3>
          
          <div className="space-y-4">
            {[
              { 
                status: 'requested', 
                label: 'Ride Requested', 
                time: rideDetails.createdAt,
                completed: true 
              },
              { 
                status: 'accepted', 
                label: 'Driver Assigned', 
                time: rideDetails.acceptedAt,
                completed: ['accepted', 'driver-arriving', 'driver-arrived', 'in-progress', 'completed'].includes(liveTracking.status)
              },
              { 
                status: 'driver-arriving', 
                label: 'Driver En Route to Pickup', 
                time: null,
                completed: ['driver-arriving', 'driver-arrived', 'in-progress', 'completed'].includes(liveTracking.status)
              },
              { 
                status: 'driver-arrived', 
                label: 'Driver Arrived at Pickup', 
                time: null,
                completed: ['driver-arrived', 'in-progress', 'completed'].includes(liveTracking.status)
              },
              { 
                status: 'in-progress', 
                label: 'Ride in Progress', 
                time: rideDetails.startedAt,
                completed: ['in-progress', 'completed'].includes(liveTracking.status)
              },
              { 
                status: 'completed', 
                label: 'Ride Completed', 
                time: rideDetails.completedAt,
                completed: liveTracking.status === 'completed'
              },
            ].map((step) => (
              <div key={step.status} className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                  step.completed 
                    ? 'bg-primary' 
                    : liveTracking.status === step.status
                    ? 'bg-primary/50 animate-pulse'
                    : 'bg-muted'
                }`} />
                
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.completed ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </p>
                  {step.time && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(step.time).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {liveTracking.status === step.status && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default LiveRideTracking;