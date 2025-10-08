import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Star, 
  Clock, 
  Users,
  Bell,
  Settings,
  Activity,
  Car,
  Target,
  Navigation,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetDriverProfileQuery,
  useUpdateDriverAvailabilityMutation,
  useGetDriverAnalyticsQuery,
  useGetActiveRideQuery,
  useGetIncomingRequestsQuery,
  useGetDriverEarningsQuery
} from '@/redux/features/driver/driverApi';
import { 
  updateAvailabilityStatus,
  updateCurrentLocation 
} from '@/redux/features/driver/driverSlice';
import { RootState } from '@/redux/store';

const EnhancedDriverDashboard = () => {
  const dispatch = useDispatch();
  const { isOnline, currentLocation, notifications } = useSelector((state: RootState) => state.driver);
  
  const { data: driverProfile } = useGetDriverProfileQuery();
  const { data: analytics } = useGetDriverAnalyticsQuery({ period: 'week' });
  const { data: activeRide } = useGetActiveRideQuery();
  const { data: incomingRequests } = useGetIncomingRequestsQuery();
  const { data: earnings } = useGetDriverEarningsQuery({ period: 'daily' });
  
  const [updateAvailability] = useUpdateDriverAvailabilityMutation();
  
  // Location tracking
  useEffect(() => {
    if (isOnline && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(updateCurrentLocation({
            latitude,
            longitude,
            address: 'Current Location' // You'd geocode this in a real app
          }));
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get current location');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOnline, dispatch]);

  const handleAvailabilityToggle = async () => {
    try {
      const newStatus = !isOnline;
      await updateAvailability(newStatus).unwrap();
      
      dispatch(updateAvailabilityStatus({ 
        isOnline: newStatus, 
        isAvailable: newStatus 
      }));
      
      toast.success(`You are now ${newStatus ? 'online' : 'offline'}`);
    } catch {
      toast.error('Failed to update availability status');
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  return (
    <div className="space-y-6">
      {/* Header with Online/Offline Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">
            {driverProfile && `Welcome back, ${driverProfile.firstName}!`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </Button>
          
          {/* Availability Status */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Switch 
              checked={isOnline} 
              onCheckedChange={handleAvailabilityToggle}
              disabled={!!activeRide}
            />
          </div>
        </div>
      </div>

      {/* Active Ride Alert */}
      <AnimatePresence>
        {activeRide && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Active Ride in Progress
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Riding with {activeRide.rider.firstName} {activeRide.rider.lastName}
                    </p>
                  </div>
                  <Badge className="ml-auto" variant="secondary">
                    {activeRide.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Requests Alert */}
      <AnimatePresence>
        {incomingRequests && incomingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      {incomingRequests.length} Incoming Request{incomingRequests.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-200">
                      You have new ride requests waiting
                    </p>
                  </div>
                  <Button size="sm" className="ml-auto">
                    View Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${earnings?.summary.earningsThisWeek?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                +{(analytics?.totalEarnings && analytics?.totalRides) ? (analytics.totalEarnings / analytics.totalRides).toFixed(2) : '0'} avg per ride
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {driverProfile?.rating?.toFixed(1) || '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {driverProfile?.totalRides || 0} total rides
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.onlineHours?.toFixed(1) || '0.0'}h
              </div>
              <p className="text-xs text-muted-foreground">
                Today's active time
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((analytics?.totalRides || 0) / Math.max((analytics?.totalRides || 0) + 5, 1) * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.totalRides || 0} completed rides
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <motion.div 
              className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-2xl font-bold text-green-600">
                ${analytics?.totalEarnings?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">Today</p>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-2xl font-bold text-blue-600">
                ${(analytics?.totalEarnings || 0 * 7).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-2xl font-bold text-purple-600">
                ${(analytics?.totalEarnings || 0 * 30).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Acceptance Rate</span>
                <span>{analytics?.completionRate?.toFixed(0) || 0}%</span>
              </div>
              <Progress value={analytics?.completionRate || 0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Rate</span>
                <span>{analytics?.completionRate?.toFixed(0) || 0}%</span>
              </div>
              <Progress value={analytics?.completionRate || 0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Rating Score</span>
                <span>{((driverProfile?.rating || 0) / 5 * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(driverProfile?.rating || 0) / 5 * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">View Rides</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-sm">Earnings</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Car className="h-6 w-6 mb-2" />
                <span className="text-sm">Vehicle</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Navigation className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{currentLocation.address}</p>
                <p className="text-sm text-muted-foreground">
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDriverDashboard;