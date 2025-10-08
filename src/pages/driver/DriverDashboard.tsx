import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  Car,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Target,
  Award,
  Shield
} from 'lucide-react';

import { toast } from 'sonner';

import {
  useGetDriverProfileQuery,
  useUpdateDriverOnlineStatusMutation,
  useUpdateDriverAvailabilityMutation,
  useGetDriverEarningsQuery,
  useGetDriverAnalyticsQuery,
  useGetRideHistoryQuery,
} from '@/redux/features/driver/driverApi';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Fetch driver profile and earnings from API
  const { data: profile } = useGetDriverProfileQuery();
  const [updateOnlineStatus, { isLoading: updatingOnline }] = useUpdateDriverOnlineStatusMutation();
  const [updateAvailability] = useUpdateDriverAvailabilityMutation();
  const { data: earningsData } = useGetDriverEarningsQuery({ period: 'weekly' });

  // Initialize online state from profile
  useEffect(() => {
    if (profile && typeof profile.isOnline === 'boolean') setIsOnline(profile.isOnline);
    if (profile && typeof profile.isAvailable === 'boolean') setIsAvailable(profile.isAvailable);
  }, [profile]);

  // Derived driver stats with safe fallbacks
  const driverStats = {
    todayEarnings: earningsData?.summary?.earningsThisWeek ?? 0,
    todayRides: earningsData?.summary?.ridesThisWeek ?? 0,
    rating: profile?.rating ?? 0,
    totalRides: profile?.totalRides ?? 0,
    completionRate: profile ? Math.round((profile.totalRides ? (profile.totalRides * 0.942) : 0) * 10) / 10 : 0,
    acceptanceRate: 87.5,
    cancellationRate: 2.1,
    hoursOnline: earningsData?.summary?.totalOnlineHours ?? 0,
    onlineHours: earningsData?.summary?.totalOnlineHours ?? 0,
    weeklyGoal: 2000,
    weeklyEarned: earningsData?.summary?.earningsThisWeek ?? 0,
  };

  const weeklyData =
    earningsData?.weekly?.map((w) => ({ day: w.week, earnings: w.totalEarnings })) || [
      { day: 'Mon', earnings: 180 },
      { day: 'Tue', earnings: 220 },
      { day: 'Wed', earnings: 190 },
      { day: 'Thu', earnings: 285 },
      { day: 'Fri', earnings: 340 },
      { day: 'Sat', earnings: 420 },
      { day: 'Sun', earnings: 365 }
    ];

  const hourlyData = earningsData?.daily?.slice(0, 7).map((d) => ({ hour: d.date, rides: d.rides })) || [
    { hour: '6AM', rides: 2 },
    { hour: '9AM', rides: 5 },
    { hour: '12PM', rides: 8 },
    { hour: '3PM', rides: 6 },
    { hour: '6PM', rides: 12 },
    { hour: '9PM', rides: 9 },
    { hour: '12AM', rides: 3 }
  ];

  // Use driver analytics & ride history from the API
  const { data: analytics } = useGetDriverAnalyticsQuery({ period: 'week' });
  const { data: rideHistory } = useGetRideHistoryQuery({ page: 1, limit: 5 });

  const recentRides =
    rideHistory?.rides?.map((r) => ({
      id: r.id,
      passenger: `${r.rider.firstName} ${r.rider.lastName}`,
      pickup: r.pickupAddress,
      destination: r.destinationAddress,
      earnings: r.fare,
      duration: `${Math.round(r.duration / 60)} min`,
      rating: r.rating ?? 0,
      status: r.status,
    })) || [];

  // Achievements - derive simple badges from analytics/summary
  const achievements = [
    { title: 'Top Rated Driver', description: 'High average rating', icon: Star, earned: (analytics?.averageRating ?? profile?.rating ?? 0) >= 4.8 },
    { title: 'Safety Champion', description: 'Low incident rate', icon: Shield, earned: true },
    { title: 'Marathon Driver', description: 'Complete 1000 rides', icon: Target, earned: (profile?.totalRides ?? 0) >= 1000 },
    { title: 'Perfect Weekend', description: '100% completion rate for weekend', icon: Award, earned: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="space-y-8 p-8">
        {/* Header Section */}
        <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Driver Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-2">Welcome back! Here's your driving overview</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg border-2 transition-all duration-300 ${isOnline ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200' : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border-gray-200'}`}>
                  <div className={`w-3 h-3 rounded-full mr-3 animate-pulse ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg border-2 transition-all duration-300 ${isAvailable ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-200' : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border-gray-200'}`}>
                  <div className={`w-3 h-3 rounded-full mr-3 ${isAvailable ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  {isAvailable ? 'Available' : 'Unavailable'}
                </div>
                <button 
                  onClick={async () => {
                    try {
                      const newStatus = !isOnline;
                      await updateOnlineStatus(newStatus).unwrap();
                      setIsOnline(newStatus);
                      toast.success(`You are now ${newStatus ? 'online' : 'offline'}`);
                    } catch {
                      toast.error('Failed to update online status');
                    }
                  }}
                  disabled={updatingOnline}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg ${isOnline ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'}`}
                >
                  <Car className="mr-2 h-5 w-5" />
                  {updatingOnline ? 'Updating...' : isOnline ? 'Go Offline' : 'Go Online'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const newVal = !isAvailable;
                      // Optimistic UI
                      setIsAvailable(newVal);
                      await updateAvailability(newVal).unwrap();
                      toast.success(`Availability set to ${newVal ? 'available' : 'unavailable'}`);
                    } catch {
                      // Revert optimistic state on failure
                      setIsAvailable((s) => !s);
                      toast.error('Failed to update availability');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isAvailable ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {isAvailable ? 'Go Unavailable' : 'Go Available'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-white/60 text-sm font-medium">Today's Earnings</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">${driverStats.todayEarnings}</div>
            <p className="text-green-100 text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              +12% from yesterday
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div className="text-white/60 text-sm font-medium">Rides Today</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{driverStats.todayRides}</div>
            <p className="text-blue-100 text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {driverStats.onlineHours}h online
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="text-white/60 text-sm font-medium">Driver Rating</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{driverStats.rating}</div>
            <p className="text-yellow-100 text-sm">Based on {driverStats.totalRides} rides</p>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-white/60 text-sm font-medium">Completion Rate</div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{driverStats.completionRate}%</div>
            <p className="text-purple-100 text-sm">Last 30 days</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <span>Weekly Earnings</span>
              </h3>
              <p className="text-gray-600 mt-2">Your earnings performance this week</p>
            </div>
            <div className="p-8">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                  <Area type="monotone" dataKey="earnings" stroke="#3B82F6" fill="url(#colorBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <span>Hourly Performance</span>
              </h3>
              <p className="text-gray-600 mt-2">Peak hours and earnings distribution</p>
            </div>
            <div className="p-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Rides']} />
                  <Bar dataKey="rides" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Rides & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Car className="h-6 w-6 text-purple-600" />
                </div>
                <span>Recent Rides</span>
              </h3>
              <p className="text-gray-600 mt-2">Your latest completed trips</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {recentRides.map((ride) => (
                  <div key={ride.id} className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {ride.passenger.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{ride.passenger}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-600 font-medium">{ride.pickup}</span>
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-gray-600 font-medium">{ride.destination}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800 mb-2">${ride.earnings}</p>
                        <div className="flex items-center justify-end space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{ride.duration}</span>
                          <div className="flex ml-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < ride.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <span>Achievements</span>
              </h3>
              <p className="text-gray-600 mt-2">Your driving milestones and badges</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className={`group relative rounded-xl p-6 border-2 transition-all duration-300 transform hover:scale-[1.02] ${achievement.earned ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 hover:border-yellow-400 hover:shadow-lg' : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-2xl shadow-lg ${achievement.earned ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-lg">{achievement.title}</p>
                          <p className="text-gray-600 mt-1">{achievement.description}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${achievement.earned ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'}`}>
                          {achievement.earned ? "Earned" : "Locked"}
                        </span>
                      </div>
                      {achievement.earned && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
