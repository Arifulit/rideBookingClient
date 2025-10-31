/* eslint-disable @typescript-eslint/no-explicit-any */


'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner'; // CORRECT IMPORT
import {
  Users,
  Car,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  BarChart3,
  Settings,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react';

import {
  useGetAdminAnalyticsQuery,
  useGetReportsOverviewQuery,
  useCreateReportMutation,
} from '@/redux/features/admin/adminApi';

interface ActivityItem {
  id: string;
  type: 'ride' | 'user' | 'driver';
  activity: string;
  time: string;
}

interface Overview {
  totalUsers: number;
  totalRiders: number;
  totalDrivers: number;
  totalRides: number;
  activeRides: number;
  onlineDrivers: number;
  pendingDriverApprovals: number;
}

export default function AdminDashboard(): JSX.Element {
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useGetAdminAnalyticsQuery();

  const {
    data: reports,
    isLoading: reportsLoading,
    isError: reportsError,
    refetch: refetchReports,
  } = useGetReportsOverviewQuery();

  const [createReport, { isLoading: creatingReport }] = useCreateReportMutation();

  // Derive Safe Overview
  const overview: Overview = React.useMemo(() => {
    const rep = reports?.overview;
    const ana = analytics;

    return {
      totalUsers: rep?.totalUsers ?? ana?.totalUsers ?? 0,
      totalRiders: rep?.totalRiders ?? 0,
      totalDrivers: ana?.totalDrivers ?? 0,
      totalRides: ana?.totalRides ?? 0,
      activeRides: ana?.activeRides ?? 0,
      onlineDrivers: rep?.onlineDrivers ?? 0,
      pendingDriverApprovals: rep?.pendingDriverApprovals ?? 0,
    };
  }, [reports?.overview, analytics]);

  // Recent Activities
  const recentActivities: ActivityItem[] = React.useMemo(() => {
    if (!reports?.recentActivity?.length) {
      return [
        { id: '1', type: 'user', activity: 'New user registered', time: 'Just now' },
        { id: '2', type: 'ride', activity: 'Ride #R123 started', time: '5 mins ago' },
      ];
    }

    return reports.recentActivity.map((r: any, i: number) => {
      const id = r.id ?? r._id ?? `act-${i}`;
      const rider = r.riderId?.fullName ?? r.riderId?.firstName ?? 'Rider';
      const driver = r.driver?.fullName ?? r.driver?.firstName ?? r.driverId ? 'Driver' : null;
      const status = r.status ? ` — ${String(r.status)}` : '';
      const time = r.timeline?.requested
        ? new Date(r.timeline.requested).toLocaleString()
        : r.createdAt
        ? new Date(r.createdAt).toLocaleString()
        : '—';

      const activity = driver ? `${rider} • ${driver}${status}` : `${rider}${status}`;

      return { id, type: 'ride' as const, activity, time };
    });
  }, [reports?.recentActivity]);

  // Generate Report
  const handleGenerateReport = async () => {
    try {
      await createReport({}).unwrap();
      toast.success('Report generated successfully!');
      refetchReports();
    } catch (err) {
      toast.error('Failed to generate report');
      console.error(err);
    }
  };

  // Stats Cards
  const stats = [
    {
      title: 'Total Rides',
      value: analyticsLoading ? '...' : overview.totalRides,
      icon: BarChart3,
      gradient: 'from-indigo-500 to-indigo-700',
      hover: 'hover:from-indigo-600 hover:to-indigo-800',
    },
    {
      title: 'Completed Rides',
      value: analyticsLoading ? '...' : analytics?.completedRides ?? '—',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      hover: 'hover:from-emerald-600 hover:to-teal-700',
    },
    {
      title: 'Cancelled Rides',
      value: analyticsLoading ? '...' : analytics?.cancelledRides ?? '—',
      icon: Activity,
      gradient: 'from-rose-500 to-pink-600',
      hover: 'hover:from-rose-600 hover:to-pink-700',
    },
    {
      title: 'Active Rides',
      value: analyticsLoading ? '...' : overview.activeRides,
      icon: Car,
      gradient: 'from-cyan-500 to-blue-600',
      hover: 'hover:from-cyan-600 hover:to-blue-700',
    },
    {
      title: 'Total Earnings',
      value: analyticsLoading ? '...' : `$${analytics?.totalEarnings?.toLocaleString() ?? 0}`,
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-600',
      hover: 'hover:from-purple-600 hover:to-pink-700',
    },
    {
      title: 'Total Users',
      value: analyticsLoading ? '...' : overview.totalUsers,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600',
      hover: 'hover:from-blue-600 hover:to-cyan-700',
    },
    {
      title: 'Online Drivers',
      value: analyticsLoading ? '...' : overview.onlineDrivers,
      icon: Clock,
      gradient: 'from-orange-500 to-red-600',
      hover: 'hover:from-orange-600 hover:to-red-700',
    },
  ];

  const isLoading = analyticsLoading || reportsLoading;

  return (
    <>
      {/* CORRECT: Use Toaster, not ToastContainer */}
      <Toaster position="top-right" richColors closeButton />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-2">Real-time platform insights & control center</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    refetchAnalytics();
                    refetchReports();
                  }}
                  className="p-3 bg-white/80 backdrop-blur rounded-xl shadow hover:shadow-lg transition-all hover:rotate-12"
                  title="Refresh Data"
                >
                  <RefreshCw className="h-5 w-5 text-gray-700" />
                </button>

                <button
                  onClick={handleGenerateReport}
                  disabled={creatingReport || isLoading}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingReport || isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Error Alert */}
          {(analyticsError || reportsError) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <AlertCircle className="h-6 w-6" />
              <div>
                <p className="font-semibold">Data Load Failed</p>
                <p className="text-sm">Check your connection and try refreshing.</p>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`relative group bg-gradient-to-br ${stat.gradient} ${stat.hover} rounded-3xl shadow-xl p-6 border border-white/30 overflow-hidden cursor-pointer transition-all duration-300`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/30 backdrop-blur-sm rounded-xl">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-white/70 text-xs font-medium">{stat.title}</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Live
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                Rides Summary
              </h3>
              <ul className="space-y-3 text-gray-700">
                <StatItem label="Total Rides" value={overview.totalRides} />
                <StatItem label="Completed" value={analytics?.completedRides ?? '—'} />
                <StatItem label="Cancelled" value={analytics?.cancelledRides ?? '—'} />
                <StatItem label="Active" value={overview.activeRides} />
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Users & Drivers
              </h3>
              <ul className="space-y-3 text-gray-700">
                <StatItem label="Total Users" value={overview.totalUsers} />
                <StatItem label="Total Riders" value={overview.totalRiders} />
                <StatItem label="Total Drivers" value={overview.totalDrivers} />
                <StatItem label="Online Drivers" value={overview.onlineDrivers} />
                <StatItem
                  label="Pending Approvals"
                  value={overview.pendingDriverApprovals}
                  badge={overview.pendingDriverApprovals > 0}
                />
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 shadow-xl text-white"
            >
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Total Earnings
              </h3>
              <div className="text-4xl font-bold">
                ${analytics?.totalEarnings?.toLocaleString() ?? 0}
              </div>
              <p className="text-white/80 mt-2 text-sm">All-time platform revenue</p>
            </motion.div>
          </div>

          {/* Recent Activities + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  Recent Activities
                </h3>
                <p className="text-gray-600 mt-1">Live platform events</p>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((act) => (
                      <motion.div
                        key={act.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3 h-3 rounded-full animate-pulse ${
                              act.type === 'user'
                                ? 'bg-blue-500'
                                : act.type === 'ride'
                                ? 'bg-green-500'
                                : 'bg-purple-500'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{act.activity}</p>
                            <p className="text-xs text-gray-500">{act.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  Quick Actions
                </h3>
                <p className="text-gray-600 mt-1">Admin shortcuts</p>
              </div>

              <div className="p-6 space-y-4">
                <ActionButton icon={Users} label="Manage Users" color="blue" />
                <ActionButton icon={Car} label="View Active Rides" color="green" />
                <ActionButton icon={DollarSign} label="Payouts" color="purple" />
                <ActionButton icon={Settings} label="System Settings" color="gray" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Components
const StatItem = ({ label, value, badge = false }: { label: string; value: any; badge?: boolean }) => (
  <li className="flex justify-between items-center">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-semibold ${badge ? 'text-orange-600' : 'text-gray-900'}`}>
      {value}
      {badge && value > 0 && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Pending
        </span>
      )}
    </span>
  </li>
);

const ActionButton = ({ icon: Icon, label, color }: { icon: any; label: string; color: string }) => {
  const colors: Record<string, string> = {
    blue: 'hover:border-blue-400 hover:bg-blue-50',
    green: 'hover:border-green-400 hover:bg-green-50',
    purple: 'hover:border-purple-400 hover:bg-purple-50',
    gray: 'hover:border-gray-400 hover:bg-gray-50',
  };

  return (
    <button
      className={`w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-2xl transition-all hover:shadow-md ${colors[color]}`}
    >
      <div className={`p-2 rounded-lg bg-${color}-100`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <span className="font-semibold text-gray-700">{label}</span>
    </button>
  );
};
