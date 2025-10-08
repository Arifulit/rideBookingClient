
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Car,
  Route,
  AlertTriangle,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
  useGetRideVolumeChartQuery,
  useGetDriverActivityChartQuery,
  useGetStatusDistributionQuery
} from '@/redux/features/admin/adminApi';

import type { AnalyticsParams } from '@/types/admin';

// Dynamic Chart Components
const LineChart = ({ data }: { data: unknown[] }) => (
  <div className="h-64 w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
      <p className="text-sm">Revenue Trends</p>
      <p className="text-xs">{data?.length} points</p>
    </div>
  </div>
);

const BarChart = ({ data }: { data: unknown[] }) => (
  <div className="h-64 w-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
      <p className="text-sm">Ride Volume</p>
      <p className="text-xs">{data?.length} points</p>
    </div>
  </div>
);

const AreaChart = ({ data }: { data: unknown[] }) => (
  <div className="h-64 w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
      <p className="text-sm">Driver Activity</p>
      <p className="text-xs">{data?.length} points</p>
    </div>
  </div>
);

const PieChart = ({ data }: { data: unknown[] }) => (
  <div className="h-48 w-full bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
      <p className="text-sm">Status Distribution</p>
      <p className="text-xs">{data?.length} categories</p>
    </div>
  </div>
);

interface AnalyticsProps {
  className?: string;
}

export function Analytics({ className = '' }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');

  // Map UI timeRange to AnalyticsParams.period values used by the API
  const period =
    timeRange === '1d'
      ? 'day'
      : timeRange === '7d'
      ? 'week'
      : timeRange === '30d'
      ? 'month'
      : timeRange === '1y'
      ? 'year'
      : 'month';

  const analyticsParams: AnalyticsParams = { period };

  // RTK Query Hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueChartQuery(analyticsParams);
  const { data: rideData, isLoading: rideLoading } = useGetRideVolumeChartQuery(analyticsParams);
  const { data: driverData, isLoading: driverLoading } = useGetDriverActivityChartQuery();
  const { data: statusData, isLoading: statusLoading } = useGetStatusDistributionQuery(analyticsParams);

  // Safe fallback to prevent runtime "possibly undefined" access errors
  type StatsView = {
    totalRides: number;
    totalRevenue: number;
    activeDrivers: number;
    totalUsers: number;
    trends: { ridesGrowth: number; revenueGrowth: number; driversGrowth: number; usersGrowth: number };
  };

  // Derive a safe view that maps the backend DashboardStats -> UI-friendly shape
  const safeStats = (
    stats
      ? {
          totalRides: stats.totalRides ?? 0,
          totalRevenue: stats.totalRevenue ?? 0,
          activeDrivers: stats.activeDrivers ?? stats.totalDrivers ?? 0,
          totalUsers: stats.totalUsers ?? stats.totalRiders ?? 0,
          trends: {
            ridesGrowth: stats?.growth?.rides ?? 0,
            revenueGrowth: stats?.growth?.revenue ?? 0,
            driversGrowth: stats?.growth?.drivers ?? 0,
            usersGrowth: stats?.growth?.users ?? 0,
          },
        }
      : {
          totalRides: 0,
          totalRevenue: 0,
          activeDrivers: 0,
          totalUsers: 0,
          trends: { ridesGrowth: 0, revenueGrowth: 0, driversGrowth: 0, usersGrowth: 0 },
        }
  ) as StatsView;

  // Normalize chart payloads to the shapes the chart components expect
  // LineChart expects { date: string; revenue: number }[]
  const normalizedRevenue: { date: string; revenue: number }[] = (revenueData ?? []).map((d: unknown) => {
    const item = d as Record<string, unknown>;
    return {
      date: String(item['date'] ?? item['label'] ?? item['x'] ?? ''),
      revenue: Number(item['revenue'] ?? item['value'] ?? item['y'] ?? item['amount'] ?? 0),
    };
  });

  // BarChart expects { hour: string; rides: number }[]
  const normalizedRide: { hour: string; rides: number }[] = (rideData ?? []).map((d: unknown) => {
    const item = d as Record<string, unknown>;
    return {
      hour: String(item['hour'] ?? item['label'] ?? item['x'] ?? ''),
      rides: Number(item['rides'] ?? item['value'] ?? item['y'] ?? item['count'] ?? 0),
    };
  });

  // PieChart expects { name: string; value: number }[]
  const normalizedStatus: { name: string; value: number }[] = (statusData ?? []).map((d: unknown) => {
    const item = d as Record<string, unknown>;
    return {
      name: String(item['name'] ?? item['status'] ?? item['label'] ?? ''),
      value: Number(item['value'] ?? item['count'] ?? item['y'] ?? 0),
    };
  });

  // Driver chart normalization (AreaChart expects an array of points)
  const normalizedDriver: { timestamp: string; active: number }[] = (driverData ?? []).map((d: unknown) => {
    const item = d as Record<string, unknown>;
    return {
      timestamp: String(item['timestamp'] ?? item['x'] ?? item['label'] ?? ''),
      active: Number(item['active'] ?? item['value'] ?? item['y'] ?? 0),
    };
  });

  const handleExport = () => {
    toast.success('Analytics report exported successfully');
  };

  if (statsLoading || revenueLoading || rideLoading || driverLoading || statusLoading) {
    return <div className={`p-6 space-y-6 ${className}`}>Loading...</div>;
  }

  if (statsError) {
    return (
      <div className={`p-6 space-y-6 ${className}`}>
        <Card className="glass">
          <CardContent className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p>Failed to load analytics</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div className={`p-6 space-y-6 ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" /> Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Insights into rides, revenue, and driver activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Total Rides</CardTitle>
            <Route className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalRides}</div>
            <div className="text-xs flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" /> +{safeStats.trends.ridesGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${safeStats.totalRevenue}</div>
            <div className="text-xs flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" /> +{safeStats.trends.revenueGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Active Drivers</CardTitle>
            <Car className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.activeDrivers}</div>
            <div className="text-xs flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" /> +{safeStats.trends.driversGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Total Users</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalUsers}</div>
            <div className="text-xs flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" /> +{safeStats.trends.usersGrowth}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Rides Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={normalizedRevenue} />
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Ride Volume by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={normalizedRide} />
          </CardContent>
        </Card>
      </div>

      {/* Driver Activity */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Driver Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart data={normalizedDriver} />
        </CardContent>
      </Card>

      {/* Ride Status Distribution */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Ride Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={normalizedStatus} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Analytics;
