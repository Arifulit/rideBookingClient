import { useState } from 'react';
import { MapPin, Clock, DollarSign, User } from 'lucide-react';
import { useGetRideRequestsQuery, useAcceptRideRequestMutation, type RideRequest } from '@/redux/features/driver/driverApi';
import { toast } from 'sonner';

export default function AvailableRides() {
  const [filter, setFilter] = useState('all');

  // Fetch ride requests from backend
  const { data: requests = [], isLoading, isFetching, isError, error } = useGetRideRequestsQuery({ showAll: true });
  const [acceptRideRequest, { isLoading: isAccepting }] = useAcceptRideRequestMutation();


  console.debug('AvailableRides - getRideRequests result:', { requests, isLoading, isFetching, isError, error });

  const handleAcceptRide = async (rideId: string) => {
    try {
      console.log('Accepting ride via API:', rideId);
      await acceptRideRequest(rideId).unwrap();
      toast.success('Ride accepted');
    } catch (err) {
      console.error('Failed to accept ride', err);
      toast.error('Failed to accept ride');
    }
  };

  const filteredRides = filter === 'nearby'
    ? requests.filter((ride: RideRequest) => (ride.estimatedDistance ?? 0) / 1000 < 10)
    : requests;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Rides</h1>
            <p className="text-gray-600">Loading rides from server...</p>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2">
            <option value="all">All Rides</option>
            <option value="nearby">Nearby Only (&lt; 10km)</option>
          </select>
        </div>
        <div className="text-center py-12 text-gray-500">Loading rides...</div>
      </div>
    );
  }

  if (isError) {
    console.error('AvailableRides - error fetching rides:', error);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Available Rides</h1>
        <div className="text-red-600">Failed to load rides from server. Check console for details.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Rides</h1>
          <p className="text-gray-600">Find and accept rides in your area</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="all">All Rides</option>
          <option value="nearby">Nearby Only (&lt; 10km)</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredRides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No rides available at the moment</p>
          </div>
        ) : (
          filteredRides.map((ride: RideRequest) => (
            <div key={ride.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{ride.rider?.firstName} {ride.rider?.lastName}</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{Math.round((ride.estimatedDuration ?? 0) / 60)} min</span>
                    <span className="text-sm text-gray-500">({((ride.estimatedDistance ?? 0)/1000).toFixed(1)} km)</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{ride.pickupLocation?.address}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{ride.destinationLocation?.address}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">${(ride.estimatedFare ?? 0).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500">Estimated fare</p>
                  </div>

                  <button
                    onClick={() => handleAcceptRide(ride.id)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isAccepting}
                  >
                    {isAccepting ? 'Accepting...' : 'Accept Ride'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredRides.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Showing {filteredRides.length} available ride{filteredRides.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
