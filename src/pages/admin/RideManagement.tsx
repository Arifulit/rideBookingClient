import { useState } from 'react';
import { Car, Search, MapPin, Clock, DollarSign, Calendar } from 'lucide-react';

interface Ride {
  id: string;
  riderId: string;
  riderName: string;
  driverId?: string;
  driverName?: string;
  pickup: string;
  destination: string;
  fare: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'wallet';
  createdAt: string;
  completedAt?: string;
  distance: number;
  duration: number;
}

const RideManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock ride data
  const rides: Ride[] = [
    {
      id: 'R001',
      riderId: 'U001',
      riderName: 'John Doe',
      driverId: 'D001',
      driverName: 'Sarah Wilson',
      pickup: '123 Main St, Downtown',
      destination: '456 Oak Ave, Uptown',
      fare: 25.50,
      status: 'completed',
      paymentMethod: 'card',
      createdAt: '2024-03-15T10:30:00Z',
      completedAt: '2024-03-15T11:05:00Z',
      distance: 8.5,
      duration: 35
    },
    {
      id: 'R002',
      riderId: 'U002',
      riderName: 'Emily Chen',
      pickup: '789 Pine St, Central',
      destination: '321 Elm St, Westside',
      fare: 18.75,
      status: 'pending',
      paymentMethod: 'wallet',
      createdAt: '2024-03-15T14:15:00Z',
      distance: 6.2,
      duration: 0
    },
    {
      id: 'R003',
      riderId: 'U003',
      riderName: 'Mike Johnson',
      driverId: 'D002',
      driverName: 'Alex Rodriguez',
      pickup: '555 Broadway, Theater District',
      destination: '999 Fifth Ave, Shopping',
      fare: 32.00,
      status: 'in_transit',
      paymentMethod: 'cash',
      createdAt: '2024-03-15T16:45:00Z',
      distance: 12.3,
      duration: 0
    },
    {
      id: 'R004',
      riderId: 'U004',
      riderName: 'Lisa Park',
      pickup: '777 Tech Ave, Silicon Valley',
      destination: '888 Innovation Dr, Tech Hub',
      fare: 0,
      status: 'cancelled',
      paymentMethod: 'card',
      createdAt: '2024-03-15T09:20:00Z',
      distance: 4.1,
      duration: 0
    }
  ];

  const filteredRides = rides.filter(ride => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      ride.riderName.toLowerCase().includes(q) ||
      (ride.driverName?.toLowerCase() ?? '').includes(q) ||
      ride.pickup.toLowerCase().includes(q) ||
      ride.destination.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === 'all' || ride.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
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
    totalRevenue: rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ride Management</h1>
          <p className="text-gray-600">Monitor and manage all platform rides</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <Car className="mr-2 h-4 w-4" />
          Export Rides
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Rides</h3>
            <Car className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{statsData.total}</div>
          <p className="text-xs text-gray-500">All time</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <Car className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold">{statsData.completed}</div>
          <p className="text-xs text-gray-500">Successful rides</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Rides</h3>
            <Car className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{statsData.active}</div>
          <p className="text-xs text-gray-500">In progress</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Cancelled</h3>
            <Car className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold">{statsData.cancelled}</div>
          <p className="text-xs text-gray-500">Cancelled rides</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">${statsData.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-500">From completed rides</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Rides</h2>
          <p className="text-gray-600 mt-1">A comprehensive list of all rides in the system</p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_transit">In Transit</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Rides Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rider</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Driver</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Route</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Fare</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRides.map((ride) => (
                  <tr key={ride.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{ride.riderName}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {ride.driverName ? (
                        <div>
                          <div className="font-medium">{ride.driverName}</div>
                          <div className="text-sm text-gray-500">ID: {ride.driverId}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
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
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                        {ride.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {ride.status === 'cancelled' ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <span className="font-medium">${ride.fare.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(ride.paymentMethod)}`}>
                        {ride.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ride.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRides.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No rides found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideManagement;