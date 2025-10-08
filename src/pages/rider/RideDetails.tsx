import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Star, 
  DollarSign,
  Navigation,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Car
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  useGetRideDetailsQuery,
  useCancelRideRequestMutation,
  useRateDriverMutation 
} from '@/redux/features/rider/riderApi';
import RideTrackingMap from './components/RideTrackingMap';
import RideStatusTimeline from './components/RideStatusTimeline';
import DriverRatingDialog from './components/DriverRatingDialog';

interface RideDetailsProps {
  className?: string;
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: Clock,
    label: 'Pending'
  },
  accepted: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: CheckCircle2,
    label: 'Accepted'
  },
  'driver-arriving': {
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: Navigation,
    label: 'Driver Arriving'
  },
  'in-progress': {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: Car,
    label: 'In Progress'
  },
  completed: {
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
    label: 'Completed'
  },
  cancelled: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: XCircle,
    label: 'Cancelled'
  },
} as const;

export function RideDetails({ className = '' }: RideDetailsProps) {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  
  const { data: ride, isLoading, error, refetch } = useGetRideDetailsQuery(
    rideId || '', 
    { skip: !rideId }
  );
  
  const [cancelRide, { isLoading: cancelling }] = useCancelRideRequestMutation();
  const [rateDriver] = useRateDriverMutation();
  
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Auto-refresh for active rides
  useEffect(() => {
    if (ride && ['pending', 'accepted', 'driver-arriving', 'in-progress'].includes(ride.status)) {
      const interval = setInterval(() => {
        refetch();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [ride, refetch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleCancelRide = async () => {
    if (!ride || !['pending', 'accepted', 'driver-arriving'].includes(ride.status)) {
      toast.error('Cannot cancel ride at this stage');
      return;
    }

    try {
      await cancelRide({ rideId: ride.id }).unwrap();
      toast.success('Ride cancelled successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } })?.data?.message || 'Failed to cancel ride'
        : 'Failed to cancel ride';
      toast.error(errorMessage);
    }
  };

  const handleRateDriver = async (rating: number, comment?: string) => {
    if (!ride) return;

    try {
      await rateDriver({
        rideId: ride.id,
        driverId: ride.driver.id,
        rating,
        comment
      }).unwrap();
      
      toast.success('Rating submitted successfully');
      setShowRatingDialog(false);
      refetch();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } })?.data?.message || 'Failed to submit rating'
        : 'Failed to submit rating';
      toast.error(errorMessage);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Ride Details',
          text: `Ride from ${ride?.pickupLocation.address} to ${ride?.destinationLocation.address}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch {
      toast.error('Failed to share');
    }
  };

  const handleDownloadReceipt = () => {
    // Implementation for downloading receipt
    toast.info('Receipt download feature coming soon');
  };

  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ride Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error ? 'Failed to load ride details' : 'The ride you are looking for does not exist.'}
            </p>
            <Button onClick={() => navigate('/rider/rides')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rides
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus = statusConfig[ride.status as keyof typeof statusConfig];

  return (
    <motion.div 
      className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Ride Details
            </h1>
            <p className="text-muted-foreground">
              {formatDateTime(ride.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          {ride.status === 'completed' && (
            <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-center">
        <Badge 
          className={`px-4 py-2 text-lg font-semibold ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor} border`}
        >
          <currentStatus.icon className="h-5 w-5 mr-2" />
          {currentStatus.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Section */}
          {showMap && (
            <Card className="glass">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Route Map
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMap(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RideTrackingMap
                  pickup={ride.pickupLocation}
                  destination={ride.destinationLocation}
                  driverLocation={ride.driver?.currentLocation}
                  rideStatus={ride.status}
                  className="h-64 rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Locations */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pickup */}
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium text-foreground">{ride.pickupLocation.address}</p>
                  {ride.pickupTime && (
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(ride.pickupTime)}
                    </p>
                  )}
                </div>
              </div>

              <div className="ml-1.5 border-l-2 border-dashed border-muted h-4"></div>

              {/* Destination */}
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium text-foreground">{ride.destinationLocation.address}</p>
                  {ride.dropoffTime && (
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(ride.dropoffTime)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ride Status Timeline */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Ride Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RideStatusTimeline
                currentStatus={ride.status}
                timestamps={{
                  requested: ride.createdAt,
                  accepted: ride.acceptedAt,
                  driverArriving: ride.driverArrivingAt,
                  pickupTime: ride.pickupTime,
                  dropoffTime: ride.dropoffTime,
                  cancelledAt: ride.cancelledAt
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Driver Info */}
          {ride.driver && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Driver Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={ride.driver.profileImage} 
                      alt={ride.driver.name} 
                    />
                    <AvatarFallback>
                      {ride.driver.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{ride.driver.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {ride.driver.rating.toFixed(1)} ({ride.driver.totalRides} rides)
                      </span>
                    </div>
                  </div>
                </div>

                {ride.driver.vehicle && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Vehicle</p>
                      <p className="font-medium text-foreground">
                        {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                      </p>
                      <p className="text-muted-foreground">
                        {ride.driver.vehicle.licensePlate} • {ride.driver.vehicle.color}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {ride.status === 'accepted' || ride.status === 'driver-arriving' ? (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(`tel:${ride.driver.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Driver
                    </Button>
                  ) : null}

                  {ride.status === 'completed' && !ride.rating && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowRatingDialog(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate Driver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fare Breakdown */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fare Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Fare</span>
                <span className="text-foreground">{formatCurrency(ride.fare.baseFare)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance Fee</span>
                <span className="text-foreground">{formatCurrency(ride.fare.distanceFare)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Fee</span>
                <span className="text-foreground">{formatCurrency(ride.fare.timeFare)}</span>
              </div>

              {ride.fare.surgeFare > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Surge Fee</span>
                  <span className="text-orange-600">+{formatCurrency(ride.fare.surgeFare)}</span>
                </div>
              )}

              {ride.fare.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatCurrency(ride.fare.discount)}</span>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCurrency(ride.fare.total)}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                Payment via {ride.paymentMethod}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {['pending', 'accepted', 'driver-arriving'].includes(ride.status) && (
            <Card className="glass border-destructive/20">
              <CardContent className="pt-6">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleCancelRide}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin"></div>
                      Cancelling...
                    </div>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Ride
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Cancellation charges may apply
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rating Dialog */}
      <DriverRatingDialog
        open={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        driver={ride.driver}
        onSubmit={handleRateDriver}
      />
    </motion.div>
  );
}

export default RideDetails;