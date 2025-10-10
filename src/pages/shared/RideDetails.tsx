import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetRideDetailsQuery } from '@/redux/features/rider/riderApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  DollarSign,
  Star,
  Car,
  Phone,
  CreditCard,
  MessageCircle,
  Download,
  Flag,
  Route,
  Timer
} from 'lucide-react';

const RideDetails = () => {
  const { rideId } = useParams();

  // Fetch ride details from API when rideId is present - no mock fallback
  const {
    data: rideDataFromApi,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRideDetailsQuery(rideId as string, {
    skip: !rideId,
  });

  const rideData = rideDataFromApi;

  if (isLoading) {
    return (
      <div className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Loading ride details...</CardTitle>
            <CardDescription>Please wait while we fetch the ride information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Connecting to server...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Failed to load ride</CardTitle>
            <CardDescription>There was a problem fetching ride details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Could not fetch ride details. Check your network or authentication.</p>
            {error && (
              <p className="text-xs text-red-500 mt-2">{extractErrorMessage(error)}</p>
            )}
            <div className="mt-4">
              <Button variant="ghost" onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rideData) {
    return (
      <div className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>No ride found</CardTitle>
            <CardDescription>The ride could not be found. It may have been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Try a different Ride ID or check with support.</p>
            <div className="mt-4">
              <Button variant="ghost" onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return CreditCard;
      case 'debit_card': return CreditCard;
      case 'cash': return DollarSign;
      default: return DollarSign;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Safely extract message from unknown error shapes (hoisted function to avoid TDZ)
  function extractErrorMessage(err: unknown): string {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ride Details</h1>
          <p className="text-gray-600">Complete information about ride #{rideData.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Receipt
          </Button>
          <Button variant="outline">
            <Flag className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        </div>
      </div>

      {/* Ride Status and Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ride #{rideData.id}</CardTitle>
              <CardDescription>
                {new Date(rideData.createdAt).toLocaleDateString()} at {new Date(rideData.createdAt).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(rideData.status)}>
              {rideData.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Route className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500">Distance</p>
              <p className="text-xl font-semibold">{rideData.route.distance} km</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-xl font-semibold">{formatDuration(rideData.route.duration)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-500">Total Fare</p>
              <p className="text-xl font-semibold">${rideData.payment.total}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rideData.rating.riderRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rider Information */}
        <Card>
          <CardHeader>
            <CardTitle>Rider Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={rideData.rider.avatar} />
                <AvatarFallback>
                  {rideData.rider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{rideData.rider.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  {rideData.rider.rating} rating
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{rideData.rider.phone}</span>
              </div>
              <Button size="sm" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>
            {rideData.rating.riderComment && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Rider's Comment:</p>
                <p className="text-sm text-gray-700">{rideData.rating.riderComment}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={rideData.driver.avatar} />
                <AvatarFallback>
                  {rideData.driver.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{rideData.driver.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  {rideData.driver.rating} rating
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {rideData.driver.vehicleInfo.color} {rideData.driver.vehicleInfo.year} {rideData.driver.vehicleInfo.make} {rideData.driver.vehicleInfo.model}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">License Plate:</span>
              <Badge variant="outline">{rideData.driver.vehicleInfo.licensePlate}</Badge>
            </div>
            {rideData.rating.driverComment && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Driver's Comment:</p>
                <p className="text-sm text-gray-700">{rideData.rating.driverComment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Route Information */}
      <Card>
        <CardHeader>
          <CardTitle>Route Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Pickup Location</p>
                <p className="text-sm text-gray-600">{rideData.pickup.address}</p>
                {rideData.pickup.instructions && (
                  <p className="text-xs text-gray-500 mt-1">Note: {rideData.pickup.instructions}</p>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-red-500 mt-1" />
              <div>
                <p className="font-medium">Destination</p>
                <p className="text-sm text-gray-600">{rideData.destination.address}</p>
                {rideData.destination.instructions && (
                  <p className="text-xs text-gray-500 mt-1">Note: {rideData.destination.instructions}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Ride Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">Ride Requested</p>
                <p className="text-sm text-gray-600">{new Date(rideData.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Driver Arrived & Trip Started</p>
                <p className="text-sm text-gray-600">{new Date(rideData.startedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Trip Completed</p>
                <p className="text-sm text-gray-600">{new Date(rideData.completedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Base Fare</span>
              <span>${rideData.payment.baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Distance Fare ({rideData.route.distance} km)</span>
              <span>${rideData.payment.distanceFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Time Fare ({formatDuration(rideData.route.duration)})</span>
              <span>${rideData.payment.timeFare.toFixed(2)}</span>
            </div>
            {rideData.payment.surge > 0 && (
              <div className="flex justify-between items-center">
                <span>Surge Pricing</span>
                <span>${rideData.payment.surge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Tip</span>
              <span>${rideData.payment.tip.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span>${rideData.payment.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax</span>
              <span>${rideData.payment.tax.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total</span>
              <span>${rideData.payment.total.toFixed(2)}</span>
            </div>
            <div className="flex items-center mt-4 p-3 bg-gray-50 rounded-lg">
              {React.createElement(getPaymentMethodIcon(rideData.payment.method), { className: "h-5 w-5 mr-2 text-gray-600" })}
              <span className="text-sm capitalize">
                Paid via {rideData.payment.method.replace('_', ' ')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideDetails;