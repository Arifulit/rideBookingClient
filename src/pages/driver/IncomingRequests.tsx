/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Navigation,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useGetIncomingRequestsQuery,
  useRespondToRequestMutation,
  type RideRequest
} from '@/redux/features/driver/driverApi';
import { removeIncomingRequest, setActiveRide } from '@/redux/features/driver/driverSlice';

interface IncomingRequestCardProps {
  request: RideRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

const IncomingRequestCard = ({ request, onAccept, onReject }: IncomingRequestCardProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiryTime = new Date(request.expiresAt).getTime();
      const currentTime = new Date().getTime();
      const difference = expiryTime - currentTime;
      
      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
        setIsExpiring(difference < 10000); // Last 10 seconds
      } else {
        setTimeLeft(0);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [request.expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / 30) * 100; // Assuming 30 second timeout

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`border-2 rounded-lg p-4 ${isExpiring ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}
    >
      {/* Timer */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Time to respond</span>
          <span className={`text-lg font-bold ${isExpiring ? 'text-red-600' : 'text-blue-600'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className={`h-2 ${isExpiring ? 'bg-red-200' : 'bg-blue-200'}`}
        />
      </div>

      {/* Rider Info */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={request.rider.profileImage} alt={request.rider.firstName} />
          <AvatarFallback>
            {request.rider.firstName[0]}{request.rider.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {request.rider.firstName} {request.rider.lastName}
          </h3>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{request.rider.rating.toFixed(1)}</span>
            <Badge variant="outline" className="ml-2">
              {request.rideType.charAt(0).toUpperCase() + request.rideType.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trip Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Pickup</p>
            <p className="font-medium">{request.pickupLocation.address}</p>
          </div>
          <Button variant="ghost" size="sm">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="ml-6 border-l-2 border-dashed border-gray-300 h-4" />
        
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Destination</p>
            <p className="font-medium">{request.destinationLocation.address}</p>
          </div>
        </div>
      </div>

      {/* Trip Estimates */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-lg font-bold text-green-600">
            ${request.estimatedFare.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">Fare</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-blue-600">
            {(request.estimatedDistance / 1000).toFixed(1)}km
          </p>
          <p className="text-xs text-muted-foreground">Distance</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-purple-600">
            {Math.round(request.estimatedDuration / 60)}min
          </p>
          <p className="text-xs text-muted-foreground">Duration</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onReject(request.id, 'Driver declined')}
          variant="outline"
          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Decline
        </Button>
        
        <Button
          onClick={() => onAccept(request.id)}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Accept Ride
        </Button>
      </div>

      {/* Additional Info */}
      {request.notes && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm">
            <strong>Note:</strong> {request.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const IncomingRequests = () => {
  const dispatch = useDispatch();
  const { data: requests = [], isLoading, refetch } = useGetIncomingRequestsQuery();
  const [respondToRequest] = useRespondToRequestMutation();

  // Auto-refresh requests
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const handleAccept = async (requestId: string) => {
    try {
      await respondToRequest(requestId).unwrap();
      dispatch(removeIncomingRequest(requestId));
      
      // Find the accepted request and set it as active ride
      const acceptedRequest = requests.find((r: any) => r.id === requestId);
      if (acceptedRequest) {
        dispatch(setActiveRide({
          id: acceptedRequest.id,
          riderId: acceptedRequest.riderId,
          driverId: '', // Will be filled by backend
          rider: acceptedRequest.rider,
          pickupLocation: acceptedRequest.pickupLocation,
          destinationLocation: acceptedRequest.destinationLocation,
          rideType: acceptedRequest.rideType,
          status: 'accepted',
          fare: {
            baseFare: 0,
            distanceFare: 0,
            timeFare: 0,
            total: acceptedRequest.estimatedFare
          },
          paymentMethod: acceptedRequest.paymentMethod,
          acceptedAt: new Date().toISOString()
        }));
      }
      
      toast.success('Ride request accepted!');
    } catch {
      toast.error('Failed to accept ride request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await respondToRequest(requestId).unwrap();
      dispatch(removeIncomingRequest(requestId));
      toast.success('Ride request declined');
    } catch {
      toast.error('Failed to decline ride request');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading Incoming Requests...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incoming Requests</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {requests.length} Request{requests.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Incoming Requests</h3>
            <p className="text-muted-foreground text-center">
              When riders request rides in your area, they'll appear here.
              <br />
              Make sure you're online and available to receive requests.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((request: any) => (
              <IncomingRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default IncomingRequests;