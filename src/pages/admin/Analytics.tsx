/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Car,
  Route,
  Download,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Toaster, toast } from 'sonner';

// ── RTK-Query hooks ───────────────────────────────────────────────────────
import {
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
  useGetRideVolumeChartQuery,
  useGetDriverActivityChartQuery,
  useGetStatusDistributionQuery,
} from '@/redux/features/admin/adminApi';
import type { AnalyticsParams } from '@/types/admin';

// ── UI COMPONENTS ─────────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  trend,
  icon: Icon,
  color,
  prefix = '',
}: {
  title: string;
  value: number | string;
  trend: number;
  icon: any;
  color: string;
  prefix?: string;
}) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div
        className={`flex items-center gap-1 text-sm font-semibold ${
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {Math.abs(trend)}%
      </div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">
      {prefix}
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
  </div>
);

/* ─────────────────────── SVG CHARTS (unchanged) ─────────────────────── */
const LineChart = ({ data }: { data: { date: string; revenue: number; rides: number }[] }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxRides = Math.max(...data.map((d) => d.rides), 1);

  return (
    <div className="h-80 flex items-end justify-between gap-2 px-4">
      {data.slice(0, 20).map((item, i) => {
        const revenueHeight = (item.revenue / maxRevenue) * 100;
        const ridesHeight = (item.rides / maxRides) * 100;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-1" style={{ height: '240px' }}>
              <div
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer relative group"
                style={{ height: `${revenueHeight}%` }}
                title={`Revenue: $${item.revenue}`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${item.revenue}
                </div>
              </div>
              <div
                className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg hover:from-purple-600 hover:to-purple-500 transition-all cursor-pointer relative group"
                style={{ height: `${ridesHeight}%` }}
                title={`Rides: ${item.rides}`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.rides}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2">{item.date}</span>
          </div>
        );
      })}
    </div>
  );
};

const BarChart = ({ data }: { data: { hour: string; rides: number }[] }) => {
  const maxValue = Math.max(...data.map((d) => d.rides), 1);

  return (
    <div className="h-80 flex items-end justify-between gap-3 px-4">
      {data.slice(0, 20).map((item, i) => {
        const height = (item.rides / maxValue) * 100;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full" style={{ height: '240px' }}>
              <div className="h-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-xl hover:from-green-600 hover:to-green-500 transition-all cursor-pointer relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.rides} rides
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">{item.hour}</span>
          </div>
        );
      })}
    </div>
  );
};

const PieChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  const total = data.reduce((s, i) => s + i.value, 0) || 1;
  let currentAngle = 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {data.map((item, i) => {
            const pct = (item.value / total) * 100;
            const angle = (pct / 100) * 360;
            const start = currentAngle;
            currentAngle += angle;
            const x1 = 100 + 90 * Math.cos((start * Math.PI) / 180);
            const y1 = 100 + 90 * Math.sin((start * Math.PI) / 180);
            const x2 = 100 + 90 * Math.cos((currentAngle * Math.PI) / 180);
            const y2 = 100 + 90 * Math.sin((currentAngle * Math.PI) / 180);
            const large = angle > 180 ? 1 : 0;

            return (
              <path
                key={i}
                d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${large} 1 ${x2} ${y2} Z`}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
              />
            );
          })}
          <circle cx="100" cy="100" r="50" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Rides</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">{item.value.toLocaleString()}</p>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {((item.value / total) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaChart = ({ data }: { data: { timestamp: string; active: number }[] }) => {
  const maxValue = Math.max(...data.map((d) => d.active), 1);

  return (
    <div className="h-80 flex items-end justify-between gap-1 px-4 relative">
      <div className="absolute inset-0 flex items-end">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>
          <path
            d={`M 0 100 ${data
              .slice(0, 20)
              .map((item, i) => {
                const x = (i / Math.min(data.length - 1, 19)) * 100;
                const y = 100 - (item.active / maxValue) * 80;
                return `L ${x} ${y}`;
              })
              .join(' ')} L 100 100 Z`}
            fill="url(#areaGradient)"
          />
          <path
            d={`M 0 ${100 - (data[0]?.active / maxValue) * 80} ${data
              .slice(0, 20)
              .map((item, i) => {
                const x = (i / Math.min(data.length - 1, 19)) * 100;
                const y = 100 - (item.active / maxValue) * 80;
                return `L ${x} ${y}`;
              })
              .join(' ')}`}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            className="drop-shadow-sm"
          />
        </svg>
      </div>

      {data.slice(0, 20).map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-full relative group cursor-pointer" style={{ height: '240px' }}>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {item.active} active
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-2 break-all">{item.timestamp}</span>
        </div>
      ))}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────── */
export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '1y'>('7d');

  const periodMap: Record<typeof timeRange, AnalyticsParams['period']> = {
    '1d': 'day',
    '7d': 'week',
    '30d': 'month',
    '1y': 'year',
  };
  const params: AnalyticsParams = { period: periodMap[timeRange] };

  // ── RTK Queries ───────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery();
  const { data: revRaw, isLoading: revLoading } = useGetRevenueChartQuery(params);
  const { data: rideRaw, isLoading: rideLoading } = useGetRideVolumeChartQuery(params as any);
  const { data: driverRaw, isLoading: driverLoading } = useGetDriverActivityChartQuery(params as any);
  const { data: statusRaw, isLoading: statusLoading } = useGetStatusDistributionQuery(params);

  // ── Normalisation (Handles any backend shape) ─────────────────────────
  const ensureArray = (v: unknown): any[] => {
    if (Array.isArray(v)) return v;
    if (!v || typeof v !== 'object') return [];
    const a = v as any;
    return (
      a?.data?.series ||
      a?.series ||
      a?.data?.distribution ||
      a?.distribution ||
      a?.data?.topDrivers ||
      a?.topDrivers ||
      a?.chart ||
      a?.rows ||
      a?.data?.chart ||
      a?.data?.rows ||
      a?.data ||
      []
    );
  };

  const revenueArr = ensureArray(revRaw);
  const rideArr = ensureArray(rideRaw);
  const driverArr = ensureArray(driverRaw);
  const statusArr = ensureArray(statusRaw);

  // ── Normalize Driver Activity (from topDrivers) ───────────────────────
  const normalizedDriver = driverArr
    .filter((d: any) => d.rides > 0) // Only show active drivers
    .map((d: any) => ({
      timestamp: String(d.driverId ?? d.driver ?? 'Unknown').slice(-6),
      active: Number(d.rides ?? d.count ?? 0),
    }));

  // If no topDrivers → show online count as fallback
  const onlineDriversCount = (driverRaw as any)?.data?.overview?.onlineDrivers ?? 0;
  if (normalizedDriver.length === 0 && onlineDriversCount > 0) {
    normalizedDriver.push({ timestamp: 'Online', active: onlineDriversCount });
  }

  // ── Other Charts ──────────────────────────────────────────────────────
  const normalizedRevenue = revenueArr.map((d: any) => ({
    date: String(d.date ?? d.label ?? d.x ?? '—'),
    revenue: Number(d.revenue ?? d.value ?? d.amount ?? 0),
    rides: Number(d.rides ?? d.count ?? 0),
  }));

  const normalizedRide = rideArr.map((d: any) => ({
    hour: String(d.hour ?? d.date ?? d.label ?? '—'),
    rides: Number(d.rides ?? d.count ?? 0),
  }));

  const normalizedStatus = statusArr.map((d: any) => ({
    name: String(d.status ?? d.name ?? 'Unknown'),
    value: Number(d.count ?? d.value ?? 0),
    color:
      d.status === 'Completed' || d.name === 'Completed'
        ? '#10b981'
        : d.status === 'In Progress' || d.name === 'In Progress'
        ? '#3b82f6'
        : d.status === 'Cancelled' || d.name === 'Cancelled'
        ? '#ef4444'
        : '#f59e0b',
  }));

  // ── Safe Stats (fallback to driverRaw) ────────────────────────────────
  const safeStats = {
    totalRides: stats?.totalRides ?? 0,
    totalRevenue: stats?.totalRevenue ?? 0,
    activeDrivers: stats?.activeDrivers ?? onlineDriversCount ?? 0,
    totalUsers: stats?.totalUsers ?? 0,
    trends: {
      ridesGrowth: stats?.growth?.rides ?? 0,
      revenueGrowth: stats?.growth?.revenue ?? 0,
      driversGrowth: stats?.growth?.drivers ?? 0,
      usersGrowth: stats?.growth?.users ?? 0,
    },
  };

  // ── Export ZIP ────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder(`analytics-${new Date().toISOString().split('T')[0]}`);

      const summary = {
        'Total Rides': safeStats.totalRides,
        'Total Revenue ($)': safeStats.totalRevenue,
        'Active Drivers': safeStats.activeDrivers,
        'Total Users': safeStats.totalUsers,
        Period: timeRange,
        Generated: new Date().toLocaleString(),
      };
      folder?.file('summary.csv', Papa.unparse([summary]));
      folder?.file('revenue.csv', Papa.unparse(normalizedRevenue));
      folder?.file('ride-volume.csv', Papa.unparse(normalizedRide));
      folder?.file('driver-activity.csv', Papa.unparse(normalizedDriver));
      folder?.file('status-distribution.csv', Papa.unparse(normalizedStatus));

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `analytics-${new Date().toISOString().split('T')[0]}.zip`);
      toast.success('Report exported successfully');
    } catch (e) {
      console.error(e);
      toast.error('Export failed');
    }
  };

  // ── Loading / Error ───────────────────────────────────────────────────
  const anyLoading = statsLoading || revLoading || rideLoading || driverLoading || statusLoading;

  if (anyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl font-medium text-gray-600">Loading analytics…</div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-lg mb-4">Failed to load analytics data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Real-time ride-sharing platform insights</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer text-sm font-medium"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="1y">Last Year</option>
              </select>

              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
              >
                <Download className="h-5 w-5" />
                Export Report
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Rides"
              value={safeStats.totalRides}
              trend={safeStats.trends.ridesGrowth}
              icon={Route}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Total Revenue"
              value={safeStats.totalRevenue}
              trend={safeStats.trends.revenueGrowth}
              icon={DollarSign}
              color="from-green-500 to-green-600"
              prefix="$"
            />
            <StatCard
              title="Active Drivers"
              value={safeStats.activeDrivers}
              trend={safeStats.trends.driversGrowth}
              icon={Car}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              title="Total Users"
              value={safeStats.totalUsers}
              trend={safeStats.trends.usersGrowth}
              icon={Users}
              color="from-orange-500 to-orange-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Revenue Trends</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-gray-600">Rides</span>
                  </div>
                </div>
              </div>
              <LineChart data={normalizedRevenue} />
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Ride Volume</h3>
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <BarChart data={normalizedRide} />
            </div>
          </div>

          {/* Driver Activity */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Driver Activity</h3>
              <Car className="h-5 w-5 text-purple-600" />
            </div>
            {normalizedDriver.length > 0 ? (
              <AreaChart data={normalizedDriver} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No driver activity in this period
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Ride Status Distribution</h3>
            <PieChart data={normalizedStatus} />
          </div>
        </div>
      </div>
    </>
  );
}
