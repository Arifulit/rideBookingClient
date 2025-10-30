/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Eye,
  Shield,
  Calendar,
  Mail,
  Phone,
  RefreshCw,
  MoreHorizontal,
  Car,
  Star,
  DollarSign,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/redux/store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import {
  useGetAllDriversQuery,
  useGetAllRidersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useSuspendDriverMutation,
  useApproveDriverMutation,
  useRejectDriverMutation,
  useUpdateUserStatusMutation
} from '@/redux/features/admin/adminApi';

interface UserManagementProps {
  className?: string;
}

export default function UserManagement({ className = '' }: UserManagementProps) {
  const currentUser = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [searchRole, setSearchRole] = useState<'all' | 'drivers' | 'riders'>('all');
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const {
    data: driversData = [],
    isLoading: loadingDrivers,
    error: driversError,
    refetch: refetchDrivers
  } = useGetAllDriversQuery(undefined, { refetchOnMountOrArgChange: true });

  const {
    data: ridersData = [],
    isLoading: loadingRiders,
    error: ridersError,
    refetch: refetchRiders
  } = useGetAllRidersQuery(undefined, { refetchOnMountOrArgChange: true });

  // Mutations
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();
  const [suspendDriver, { isLoading: isSuspending }] = useSuspendDriverMutation();
  const [approveDriver, { isLoading: isApproving }] = useApproveDriverMutation();
  const [rejectDriver, { isLoading: isRejecting }] = useRejectDriverMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();

  // Debug logs
  useEffect(() => {
    console.log('🚗 Drivers data from API:', driversData);
  }, [driversData]);

  useEffect(() => {
    console.log('👤 Riders data from API:', ridersData);
  }, [ridersData]);

  // Helper function to safely get display name
  const getDisplayName = (user: any): string => {
    if (!user) return '—';
    
    // Check for fullName first
    if (user.fullName && String(user.fullName).trim()) {
      return String(user.fullName).trim();
    }
    
    // Check for firstName/lastName combination
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const combined = `${firstName} ${lastName}`.trim();
    
    if (combined) return combined;
    
    // Fallback to name field
    if (user.name && String(user.name).trim()) {
      return String(user.name).trim();
    }
    
    return '—';
  };

  // Helper to get driver ID (use _id from driver document, NOT userId._id)
  const getDriverId = (driver: any): string => {
    return driver?._id || driver?.id || '';
  };

  // Helper to get rider ID
  const getRiderId = (rider: any): string => {
    return rider?._id || rider?.id || '';
  };

  // Helper to get user ID for nested userId reference
  const getUserIdFromDriver = (driver: any): string => {
    return driver?.userId?._id || driver?.userId || '';
  };

  // Process drivers data - extract user info from nested userId
  const processedDrivers = driversData.map((driver: any) => {
    const userInfo = driver.userId || {};
    return {
      ...driver,
      // Keep the driver _id as the main id (THIS IS IMPORTANT)
      id: getDriverId(driver),
      // Store userId separately for block/unblock operations
      userIdForBlock: getUserIdFromDriver(driver),
      // Merge user info at top level for easier access
      firstName: userInfo.firstName || driver.firstName,
      lastName: userInfo.lastName || driver.lastName,
      fullName: userInfo.fullName || driver.fullName,
      email: userInfo.email || driver.email,
      phone: userInfo.phone || driver.phone,
      profileImage: userInfo.profilePicture || userInfo.profileImage || driver.profileImage,
      isBlocked: userInfo.isBlocked || driver.isBlocked || false,
      isActive: driver.approvalStatus || userInfo.isActive || 'pending',
      createdAt: userInfo.createdAt || driver.createdAt,
      emailVerified: userInfo.emailVerified || false,
      lastLogin: userInfo.lastLogin,
      role: 'driver'
    };
  });

  // Process riders data
  const processedRiders = ridersData.map((rider: any) => ({
    ...rider,
    id: getRiderId(rider),
    profileImage: rider.profilePicture || rider.profileImage,
    isActive: rider.isActive || 'active',
    role: 'rider'
  }));

  // Filter logic
  const driversFiltered = processedDrivers.filter((d: any) => {
    if (!query) return true;
    const name = getDisplayName(d).toLowerCase();
    const email = (d.email || '').toLowerCase();
    return name.includes(query.toLowerCase()) || email.includes(query.toLowerCase());
  });

  const ridersFiltered = processedRiders.filter((r: any) => {
    if (!query) return true;
    const name = getDisplayName(r).toLowerCase();
    const email = (r.email || '').toLowerCase();
    return name.includes(query.toLowerCase()) || email.includes(query.toLowerCase());
  });

  const refetchAll = () => {
    refetchDrivers();
    refetchRiders();
  };

  // Handler functions - IMPORTANT: Use correct IDs for different operations
  const handleBlockUser = useCallback(async (userId: string) => {
    try {
      setProcessingId(userId);
      console.log('🚫 Blocking user with userId:', userId);
      await blockUser({ userId }).unwrap();
      toast.success('User blocked successfully');
      refetchAll();
    } catch (err: any) {
      console.error('❌ Block error:', err);
      toast.error(err?.data?.message || 'Block failed');
    } finally {
      setProcessingId(null);
    }
  }, [blockUser]);

  const handleUnblockUser = useCallback(async (userId: string) => {
    try {
      setProcessingId(userId);
      console.log('✅ Unblocking user with userId:', userId);
      await unblockUser({ userId }).unwrap();
      toast.success('User unblocked successfully');
      refetchAll();
    } catch (err: any) {
      console.error('❌ Unblock error:', err);
      toast.error(err?.data?.message || 'Unblock failed');
    } finally {
      setProcessingId(null);
    }
  }, [unblockUser]);

  const handleSuspendDriver = useCallback(async (driverId: string) => {
    try {
      setProcessingId(driverId);
      console.log('⏸️ Suspending driver with driverId:', driverId);
      await suspendDriver({ userId: driverId }).unwrap();
      toast.success('Driver suspended successfully');
      refetchAll();
    } catch (err: any) {
      console.error('❌ Suspend error:', err);
      toast.error(err?.data?.message || 'Suspend failed');
    } finally {
      setProcessingId(null);
    }
  }, [suspendDriver]);

  const handleApproveDriver = useCallback(async (driverId: string) => {
    try {
      setProcessingId(driverId);
      console.log('✅ Approving driver with driverId:', driverId);
      await approveDriver({ userId: driverId }).unwrap();
      toast.success('Driver approved successfully');
      refetchAll();
    } catch (err: any) {
      console.error('❌ Approve error:', err);
      toast.error(err?.data?.message || 'Approve failed');
    } finally {
      setProcessingId(null);
    }
  }, [approveDriver]);

  const handleRejectDriver = useCallback(async (driverId: string) => {
    try {
      setProcessingId(driverId);
      console.log('❌ Rejecting driver with driverId:', driverId);
      await rejectDriver({ userId: driverId }).unwrap();
      toast.success('Driver rejected successfully');
      refetchAll();
    } catch (err: any) {
      console.error('❌ Reject error:', err);
      toast.error(err?.data?.message || 'Reject failed');
    } finally {
      setProcessingId(null);
    }
  }, [rejectDriver]);

  // Utility functions
  const getStatusColor = (item: any) => {
    if (item.isBlocked) return 'bg-red-100 text-red-800';
    const status = String(item.isActive || item.approvalStatus || '').toLowerCase();
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (item: any) => {
    if (item.isBlocked) return 'Blocked';
    const status = String(item.isActive || item.approvalStatus || 'Unknown');
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'driver': return 'bg-blue-100 text-blue-800';
      case 'rider': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage drivers and riders • Backend Integration Active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email"
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Select value={searchRole} onValueChange={(v) => setSearchRole(v as any)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All (Drivers & Riders)</SelectItem>
              <SelectItem value="drivers">Drivers Only</SelectItem>
              <SelectItem value="riders">Riders Only</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={refetchAll} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Drivers Section */}
      {(searchRole === 'all' || searchRole === 'drivers') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Drivers ({driversFiltered.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingDrivers ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading drivers...</span>
              </div>
            ) : driversError ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-red-600">Failed to load drivers</p>
                <Button onClick={() => refetchDrivers()} className="mt-3" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : driversFiltered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No drivers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {driversFiltered.map((driver: any) => {
                        const driverId = driver.id; // Driver document _id
                        const userId = driver.userIdForBlock; // User document _id for block/unblock
                        const displayName = getDisplayName(driver);
                        
                        return (
                          <motion.tr
                            key={driverId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage
                                    src={driver.profileImage}
                                    alt={displayName}
                                  />
                                  <AvatarFallback>
                                    {displayName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{displayName}</div>
                                  <div className="text-xs text-gray-500">
                                    Driver ID: {driverId.slice(-8)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="truncate max-w-[200px]">
                                    {driver.email || '—'}
                                  </span>
                                </div>
                                {driver.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {driver.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {driver.vehicleInfo ? (
                                  <>
                                    <div className="font-medium">
                                      {driver.vehicleInfo.make} {driver.vehicleInfo.model}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {driver.vehicleInfo.plateNumber || driver.vehicleInfo.registrationNumber}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-400">No vehicle</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(driver)}>
                                {getStatusText(driver)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {driver.joinedAt
                                  ? new Date(driver.joinedAt).toLocaleDateString()
                                  : driver.createdAt
                                  ? new Date(driver.createdAt).toLocaleDateString()
                                  : '—'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('👁️ Viewing driver:', driver);
                                    setSelectedUser(driver);
                                    setShowUserDetails(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Driver Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                      onClick={() => handleApproveDriver(driverId)}
                                      disabled={
                                        processingId === driverId ||
                                        isApproving ||
                                        driver.approvalStatus === 'approved'
                                      }
                                      className="text-green-600"
                                    >
                                      ✅ Approve Driver
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => handleRejectDriver(driverId)}
                                      disabled={
                                        processingId === driverId ||
                                        isRejecting ||
                                        driver.approvalStatus === 'rejected'
                                      }
                                      className="text-red-600"
                                    >
                                      ❌ Reject Driver
                                    </DropdownMenuItem>

                                    {driver.approvalStatus === 'approved' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleSuspendDriver(driverId)}
                                          disabled={processingId === driverId || isSuspending}
                                          className="text-yellow-600"
                                        >
                                          ⏸️ Suspend Driver
                                        </DropdownMenuItem>
                                      </>
                                    )}

                                    <DropdownMenuSeparator />

                                    {!driver.isBlocked ? (
                                      <DropdownMenuItem
                                        onClick={() => handleBlockUser(userId)}
                                        disabled={processingId === driverId || isBlocking}
                                        className="text-red-600"
                                      >
                                        🚫 Block Driver
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => handleUnblockUser(userId)}
                                        disabled={processingId === driverId || isUnblocking}
                                        className="text-green-600"
                                      >
                                        ✅ Unblock Driver
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Riders Section */}
      {(searchRole === 'all' || searchRole === 'riders') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Riders ({ridersFiltered.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingRiders ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading riders...</span>
              </div>
            ) : ridersError ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-red-600">Failed to load riders</p>
                <Button onClick={() => refetchRiders()} className="mt-3" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : ridersFiltered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No riders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rider</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {ridersFiltered.map((rider: any) => {
                        const riderId = rider.id;
                        const displayName = getDisplayName(rider);
                        return (
                          <motion.tr
                            key={riderId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage
                                    src={rider.profileImage}
                                    alt={displayName}
                                  />
                                  <AvatarFallback>
                                    {displayName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {displayName}
                                    {rider.isBlocked && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        Blocked
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Rider ID: {riderId.slice(-8)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="truncate max-w-[200px]">
                                    {rider.email || '—'}
                                  </span>
                                </div>
                                {rider.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {rider.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  rider.isBlocked
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {rider.isBlocked ? 'Blocked' : 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {rider.createdAt
                                  ? new Date(rider.createdAt).toLocaleDateString()
                                  : '—'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('👁️ Viewing rider:', rider);
                                    setSelectedUser(rider);
                                    setShowUserDetails(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Rider Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {!rider.isBlocked ? (
                                      <DropdownMenuItem
                                        onClick={() => handleBlockUser(riderId)}
                                        disabled={processingId === riderId || isBlocking}
                                        className="text-red-600"
                                      >
                                        🚫 Block Rider
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => handleUnblockUser(riderId)}
                                        disabled={processingId === riderId || isUnblocking}
                                        className="text-green-600"
                                      >
                                        ✅ Unblock Rider
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.role === 'driver' ? 'Driver Details' : 'Rider Details'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={selectedUser.profileImage}
                    alt={getDisplayName(selectedUser)}
                  />
                  <AvatarFallback className="text-2xl">
                    {getDisplayName(selectedUser).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">
                    {getDisplayName(selectedUser)}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser)}>
                      {getStatusText(selectedUser)}
                    </Badge>
                    {selectedUser.emailVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Email Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact & Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-gray-600">Email</div>
                        <div className="font-medium">{selectedUser.email || '—'}</div>
                      </div>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-gray-600">Phone</div>
                          <div className="font-medium">{selectedUser.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Account Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-gray-600">Joined</div>
                        <div className="font-medium">
                          {selectedUser.joinedAt
                            ? new Date(selectedUser.joinedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : selectedUser.createdAt
                            ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-gray-600">User ID</div>
                        <div className="font-mono text-xs font-medium">
                          {selectedUser.id}
                        </div>
                      </div>
                    </div>
                    {selectedUser.lastLogin && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-gray-600">Last Login</div>
                          <div className="font-medium">
                            {new Date(selectedUser.lastLogin).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Driver Specific Details */}
              {selectedUser.role === 'driver' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Driver Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* License Info */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">License Number</div>
                        <div className="font-medium">
                          {selectedUser.licenseNumber || '—'}
                        </div>
                      </div>

                      {/* Approval Status */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Approval Status</div>
                        <div className="font-medium capitalize">
                          {selectedUser.approvalStatus || 'pending'}
                        </div>
                      </div>

                      {/* Online Status */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Currently Online</div>
                        <div className="font-medium">
                          {selectedUser.isOnline ? (
                            <span className="text-green-600">✓ Online</span>
                          ) : (
                            <span className="text-gray-500">Offline</span>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Rating</div>
                        <div className="font-medium flex items-center gap-1">
                          {selectedUser.rating?.average ? (
                            <>
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {selectedUser.rating.average.toFixed(1)} / 5.0
                              <span className="text-xs text-gray-500 ml-1">
                                ({selectedUser.rating.count} reviews)
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">No ratings yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    {selectedUser.vehicleInfo && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Car className="w-5 h-5 text-blue-600" />
                          <h5 className="font-semibold text-blue-900">Vehicle Details</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-blue-700">Make & Model</div>
                            <div className="font-medium text-blue-900">
                              {selectedUser.vehicleInfo.make} {selectedUser.vehicleInfo.model}
                            </div>
                          </div>
                          <div>
                            <div className="text-blue-700">Year</div>
                            <div className="font-medium text-blue-900">
                              {selectedUser.vehicleInfo.year || '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-blue-700">Color</div>
                            <div className="font-medium text-blue-900">
                              {selectedUser.vehicleInfo.color || '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-blue-700">Plate Number</div>
                            <div className="font-medium text-blue-900">
                              {selectedUser.vehicleInfo.plateNumber ||
                                selectedUser.vehicleInfo.registrationNumber ||
                                '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Earnings */}
                    {selectedUser.earnings && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <h5 className="font-semibold text-green-900">Earnings</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-green-700">Total Earnings</div>
                            <div className="font-bold text-lg text-green-900">
                              ${selectedUser.earnings.total?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div>
                            <div className="text-green-700">This Month</div>
                            <div className="font-bold text-lg text-green-900">
                              ${selectedUser.earnings.thisMonth?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documents Status */}
                    {selectedUser.documentsUploaded && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <h5 className="font-semibold text-purple-900">Documents Status</h5>
                        </div>
                        <div className="space-y-2 text-sm">
                          {Object.entries(selectedUser.documentsUploaded).map(
                            ([key, value]: any) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-purple-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <Badge
                                  className={
                                    value
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {value ? '✓ Uploaded' : '✗ Missing'}
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Approval Notes */}
                    {selectedUser.approvalNotes && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-sm text-yellow-700 mb-1">Approval Notes</div>
                        <div className="font-medium text-yellow-900">
                          {selectedUser.approvalNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Rider Specific Details */}
              {selectedUser.role === 'rider' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Rider Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Account Status</div>
                        <div className="font-medium">
                          {selectedUser.isBlocked ? (
                            <span className="text-red-600">🚫 Blocked</span>
                          ) : (
                            <span className="text-green-600">✓ Active</span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Email Verification</div>
                        <div className="font-medium">
                          {selectedUser.emailVerified ? (
                            <span className="text-green-600">✓ Verified</span>
                          ) : (
                            <span className="text-yellow-600">⚠ Not Verified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedUser.isBlocked && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 text-red-800">
                          <Shield className="w-5 h-5" />
                          <span className="font-semibold">This rider is currently blocked</span>
                        </div>
                        <p className="text-sm text-red-700 mt-2">
                          The rider cannot access the platform until unblocked by an administrator.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}