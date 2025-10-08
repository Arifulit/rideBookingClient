import { useState } from 'react';
import { Car, Search, MapPin, Calendar, Star, DollarSign } from 'lucide-react';

export default function RiderRides() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock ride data
  const rides = [
    {
      id: 'R001',
      driverId: 'D001',
      driverName: 'Sarah Wilson',
      driverRating: 4.8,
      pickup: '123 Main St, Downtown',
      destination: '456 Oak Ave, Uptown',
      fare: 25.50,
      status: 'completed',
      paymentMethod: 'card',
      createdAt: '2024-03-15T10:30:00Z',
      distance: 8.5,
      duration: 35
    },
    {
      id: 'R002',
      pickup: '789 Pine St, Central',
      destination: '321 Elm St, Westside',
      fare: 18.75,
      status: 'pending',
      paymentMethod: 'wallet',
      createdAt: '2024-03-15T14:15:00Z',
      distance: 6.2,
      duration: 0
    }
  ];

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ride.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statsData = {
    total: rides.length,
    completed: rides.filter(r => r.status === 'completed').length,
    active: rides.filter(r => ['accepted', 'picked_up', 'in_transit'].includes(r.status)).length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
    totalSpent: rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-600">View and manage all your ride history</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Car className="mr-2 h-4 w-4" />
          Book New Ride
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Rides</h3>
            <Car className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{statsData.total}</div>
          <p className="text-xs text-gray-500">All time</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <Car className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold">{statsData.completed}</div>
          <p className="text-xs text-gray-500">Successful rides</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-600">Active</h3>
            <Car className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{statsData.active}</div>
          <p className="text-xs text-gray-500">In progress</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">${statsData.totalSpent.toFixed(2)}</div>
          <p className="text-xs text-gray-500">On completed rides</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ride History</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
              <p className="text-gray-500">Try adjusting your search or book your first ride!</p>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <div key={ride.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{ride.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                    {ride.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm mb-2">
                      <MapPin className="mr-1 h-3 w-3 text-green-500" />
                      <span>{ride.pickup}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-1 h-3 w-3 text-red-500" />
                      <span>{ride.destination}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {ride.driverName && (
                        <div className="flex items-center text-sm mb-1">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {ride.driverName} ({ride.driverRating})
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${ride.fare.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{ride.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 
