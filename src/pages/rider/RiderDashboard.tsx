import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, TrendingUp, Car } from 'lucide-react';

export default function RiderDashboard() {
  const navigate = useNavigate();

  // Mock data to replace Redux state
  const user = { id: 'user1', name: 'John Doe', email: 'john@example.com' };
  
  const mockRides = [
    {
      id: 'ride1',
      riderId: 'user1',
      pickup: 'Downtown Plaza',
      destination: 'Airport Terminal',
      fare: 45.50,
      status: 'completed',
      rating: 5,
      date: new Date().toISOString()
    },
    {
      id: 'ride2',
      riderId: 'user1',
      pickup: 'Mall Center',
      destination: 'University',
      fare: 22.75,
      status: 'completed',
      rating: 4,
      date: new Date().toISOString()
    },
    {
      id: 'ride3',
      riderId: 'user1',
      pickup: 'Train Station',
      destination: 'Business District',
      fare: 31.20,
      status: 'ongoing',
      rating: 0,
      date: new Date().toISOString()
    }
  ];
  
  const myRides = mockRides.filter((ride) => ride.riderId === user?.id);
  const activeRide = myRides.find((ride) => ride.status === 'ongoing' || ride.status === 'accepted');
  const completedRides = myRides.filter((ride) => ride.status === 'completed');

  // Calculate stats
  const totalRides = completedRides.length;
  const totalSpent = completedRides.reduce((sum, ride) => sum + ride.fare, 0);
  const avgRating = completedRides.length > 0 
    ? completedRides.reduce((sum, ride) => sum + (ride.rating || 0), 0) / completedRides.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-lg text-gray-600">Here's your personalized riding dashboard</p>
          </div>
          <button
            onClick={() => navigate('/rider/book')}
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Book a Ride</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{totalRides}</p>
                  <p className="text-blue-100 font-medium">Total Rides</p>
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">${totalSpent.toFixed(0)}</p>
                  <p className="text-green-100 font-medium">Total Spent</p>
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
                  <p className="text-purple-100 font-medium">Avg Rating</p>
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 rounded-full w-5/6"></div>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{activeRide ? 1 : 0}</p>
                  <p className="text-orange-100 font-medium">Active Rides</p>
                </div>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Ride */}
        {activeRide && (
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
            <div className="relative p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Car className="h-6 w-6" />
                  </div>
                  <span>Active Ride</span>
                </h3>
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="font-medium">{activeRide.pickup}</span>
                      </div>
                      <div className="w-px h-6 bg-white/30 ml-1"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="font-medium">{activeRide.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">${activeRide.fare.toFixed(2)}</p>
                    <p className="text-white/70">Estimated fare</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Rides */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <span>Recent Rides</span>
            </h3>
          </div>
          
          <div className="p-8">
            <div className="space-y-4">
              {completedRides.slice(0, 3).map((ride) => (
                <div key={ride.id} className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-semibold text-gray-800">{ride.pickup}</span>
                          </div>
                          <div className="text-gray-400">→</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-semibold text-gray-800">{ride.destination}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(ride.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800 mb-1">${ride.fare.toFixed(2)}</p>
                      <div className="flex items-center justify-end space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-lg ${i < ride.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/rider/rides')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <span>View All Rides</span>
                <TrendingUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}