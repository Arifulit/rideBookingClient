import { useState } from 'react';
import { MapPin, Clock, DollarSign, User } from 'lucide-react';

export default function AvailableRides() {
  const [filter, setFilter] = useState('all');

  // Mock ride data
  const mockRides = [
    {
      id: 'ride1',
      pickup: 'Downtown Plaza',
      destination: 'Airport Terminal',
      fare: 45.50,
      distance: '12.5 km',
      estimatedTime: '25 min',
      passenger: 'Sarah Johnson',
      status: 'pending'
    },
    {
      id: 'ride2',
      pickup: 'Mall Center',
      destination: 'University',
      fare: 22.75,
      distance: '8.2 km',
      estimatedTime: '15 min',
      passenger: 'Mike Wilson',
      status: 'pending'
    },
    {
      id: 'ride3',
      pickup: 'Train Station',
      destination: 'Business District',
      fare: 32.25,
      distance: '9.8 km',
      estimatedTime: '18 min',
      passenger: 'Lisa Chen',
      status: 'pending'
    }
  ];

  const handleAcceptRide = (rideId: string) => {
    console.log('Accepting ride:', rideId);
    alert(`Ride ${rideId} accepted successfully!`);
  };

  const filteredRides = filter === 'nearby' 
    ? mockRides.filter(ride => parseFloat(ride.distance) < 10)
    : mockRides;

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
          filteredRides.map((ride) => (
            <div key={ride.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{ride.passenger}</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{ride.estimatedTime}</span>
                    <span className="text-sm text-gray-500">({ride.distance})</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{ride.pickup}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{ride.destination}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">${ride.fare.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500">Estimated fare</p>
                  </div>

                  <button
                    onClick={() => handleAcceptRide(ride.id)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Accept Ride
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
