import { Users, Car, TrendingUp, Activity, DollarSign, Clock, BarChart3, Settings } from 'lucide-react';

const AdminDashboard = () => {
  // Mock data for demo purposes
  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+12%',
      icon: Users,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Active Rides',
      value: '1,247',
      change: '+5%',
      icon: Car,
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+8%',
      icon: DollarSign,
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Avg Response Time',
      value: '2.4 min',
      change: '-15%',
      icon: Clock,
      gradient: 'from-orange-400 to-red-500'
    }
  ];

  const recentActivities = [
    { id: 1, activity: 'New rider registered', time: '2 minutes ago', type: 'user' },
    { id: 2, activity: 'Driver completed ride #1234', time: '5 minutes ago', type: 'ride' },
    { id: 3, activity: 'Payment processed: $25.50', time: '8 minutes ago', type: 'payment' },
    { id: 4, activity: 'New driver approved', time: '15 minutes ago', type: 'driver' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-8 p-8">
        {/* Header Section */}
        <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-2">Overview of your ride-sharing platform</p>
              </div>
              <button className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg">
                <Activity className="h-5 w-5" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={`group bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-white/60 text-sm font-medium">{stat.title}</div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <p className="text-white/80 text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {stat.change} from last month
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <span>Recent Activities</span>
              </h3>
              <p className="text-gray-600 mt-2">Latest activities on your platform</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'user' ? 'bg-blue-500' :
                        activity.type === 'ride' ? 'bg-green-500' :
                        activity.type === 'payment' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{activity.activity}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <span>Quick Actions</span>
              </h3>
              <p className="text-gray-600 mt-2">Frequently used admin actions</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <button className="group w-full flex items-center justify-start space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Manage Users</span>
                </button>
                <button className="group w-full flex items-center justify-start space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-700">View Active Rides</span>
                </button>
                <button className="group w-full flex items-center justify-start space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Analytics Report</span>
                </button>
                <button className="group w-full flex items-center justify-start space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Financial Overview</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
              <span>Performance Overview</span>
            </h3>
            <p className="text-gray-600 mt-2">Platform performance metrics over time</p>
          </div>
          <div className="p-8">
            <div className="h-64 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="p-4 bg-white rounded-full shadow-lg mb-4 mx-auto w-fit">
                  <TrendingUp className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-lg font-semibold mb-2">Performance chart will be displayed here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;