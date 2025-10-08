/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import {
  Users,
  Search,
  Download,
  Eye,
  UserCheck,
  Shield,
  Calendar,
  Mail,
  Phone,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/redux/store';
import { config } from '@/config/env';

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

// RTK Query hooks
import {
  useGetUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useSuspendDriverMutation,
  useApproveDriverMutation,
  useUpdateUserStatusMutation
} from '@/redux/features/admin/adminApi';
import type { User, UserSearchParams } from '@/types/admin';



interface UserManagementProps {
  className?: string;
}

function UserManagement({ className = '' }: UserManagementProps) {
  // 🔐 Authentication State
  const currentUser = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // 🔐 Enhanced Authentication Status Check
  const checkAuthStatus = () => {
    const accessToken = localStorage.getItem('accessToken');
    const regularToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    const hasValidToken = !!(accessToken || regularToken);
    const hasUserData = !!(userData || currentUser);
    const readyForAPI = hasValidToken && hasUserData && isAuthenticated;
    
    console.log('🔍 Auth Status Check:', {
      hasValidToken,
      hasUserData,
      isAuthenticated,
      readyForAPI,
      tokenSource: accessToken ? 'accessToken' : regularToken ? 'token' : 'none'
    });
    
    return { hasValidToken, hasUserData, readyForAPI };
  };
  
  const authStatus = checkAuthStatus();

  // 📋 Search & Filter State  
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // 🔄 RTK Query Hooks
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch
  } = useGetUsersQuery(searchParams);

  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();
  const [suspendDriver, { isLoading: isSuspending }] = useSuspendDriverMutation();
  const [approveDriver, { isLoading: isApproving }] = useApproveDriverMutation();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();

  // 📊 Backend Data Management - Direct from API Only (No Mock Data)
  const users = usersResponse?.data || [];
  
  // 🔗 Connection Status & Debugging
  const connectionStatus = error ? 'error' : isLoading ? 'loading' : 'connected';
  
  // 🔧 Environment & Configuration Debug
  console.log('🌐 === ENVIRONMENT CONFIG ===');
  console.log('🔗 API Base URL:', config.api.baseURL);
  console.log('⏱️ API Timeout:', config.api.timeout);
  console.log('🏗️ App Environment:', config.app.environment);
  console.log('📱 App Title:', config.app.title);
  console.log('🔍 Logging Enabled:', config.features.enableLogging);
  console.log('🌐 === END ENVIRONMENT CONFIG ===');
  
  console.log('🔗 Connection Status:', connectionStatus);
  console.log('📊 API Response:', usersResponse);
  console.log('❌ API Error:', error);
  console.log('📈 Users from Backend:', users.length);
  console.log('🔍 Search Params:', searchParams);

  // 📝 Event Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchParams(prev => ({ ...prev, search: query, page: 1 }));
  }, []);

  const handleRoleFilter = useCallback((role: string) => {
    setSearchParams(prev => ({ ...prev, role: role as any, page: 1 }));
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setSearchParams(prev => ({ ...prev, status: status as any, page: 1 }));
  }, []);

  const handleBlockUser = useCallback(async (userId: string) => {
    try {
      console.log('🚫 Blocking user:', userId);
      await blockUser({ userId }).unwrap();
      toast.success('User blocked successfully');
      refetch();
    } catch (error: any) {
      console.error('❌ Block user error:', error);
      toast.error(error?.data?.message || 'Failed to block user');
    }
  }, [blockUser, refetch]);

  const handleUnblockUser = useCallback(async (userId: string) => {
    try {
      console.log('✅ Unblocking user:', userId);
      await unblockUser({ userId }).unwrap();
      toast.success('User unblocked successfully');
      refetch();
    } catch (error: any) {
      console.error('❌ Unblock user error:', error);
      toast.error(error?.data?.message || 'Failed to unblock user');
    }
  }, [unblockUser, refetch]);

  const handleSuspendDriver = useCallback(async (userId: string) => {
    try {
      console.log('⏸️ Suspending driver:', userId);
      await suspendDriver({ userId }).unwrap();
      toast.success('Driver suspended successfully');
      refetch();
    } catch (error: any) {
      console.error('❌ Suspend driver error:', error);
      toast.error(error?.data?.message || 'Failed to suspend driver');
    }
  }, [suspendDriver, refetch]);

  const handleApproveDriver = useCallback(async (userId: string) => {
    try {
      console.log('✅ Approving driver:', userId);
      await approveDriver({ userId }).unwrap();
      toast.success('Driver approved successfully');
      refetch();
    } catch (error: any) {
      console.error('❌ Approve driver error:', error);
      toast.error(error?.data?.message || 'Failed to approve driver');
    }
  }, [approveDriver, refetch]);

  const handleStatusUpdate = useCallback(async (userId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating user status:', userId, 'to', newStatus);
      await updateUserStatus({ userId, isActive: newStatus }).unwrap();
      toast.success(`User status updated to ${newStatus}`);
      refetch();
    } catch (error: any) {
      console.error('❌ Update status error:', error);
      toast.error(error?.data?.message || 'Failed to update status');
    }
  }, [updateUserStatus, refetch]);

  // 🎨 UI Helper Functions
  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'driver': return 'bg-blue-100 text-blue-800';
      case 'rider': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (user: User) => {
    // Check isBlocked first
    if (user.isBlocked) {
      return 'bg-red-100 text-red-800';
    }
    
    // Then check isActive
    switch (user.isActive?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (user: User) => {
    if (user.isBlocked) return 'Blocked';
    return user.isActive?.charAt(0).toUpperCase() + user.isActive?.slice(1) || 'Unknown';
  };

  // 🎯 Connection Status Component
  const ConnectionStatusIndicator = () => (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500' : 
        connectionStatus === 'loading' ? 'bg-yellow-500 animate-pulse' : 
        'bg-red-500'
      }`} />
      <span className="capitalize">{connectionStatus}</span>
      {error && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );

  // 🔧 Troubleshooting Panel
  const TroubleshootingPanel = () => {
    if (!error && authStatus.readyForAPI) return null;
    
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Connection Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authStatus.hasValidToken && (
            <div className="p-3 border border-red-200 rounded-md bg-red-50">
              <p className="text-sm text-red-800 font-medium">❌ No Authentication Token</p>
              <p className="text-xs text-red-600 mt-1">Please log in again to get a valid token.</p>
            </div>
          )}
          
          {!authStatus.hasUserData && (
            <div className="p-3 border border-orange-200 rounded-md bg-orange-50">
              <p className="text-sm text-orange-800 font-medium">⚠️ Missing User Data</p>
              <p className="text-xs text-orange-600 mt-1">User information is not available in the session.</p>
            </div>
          )}
          
          {error && (
            <div className="p-3 border border-red-200 rounded-md bg-red-50">
              <p className="text-sm text-red-800 font-medium">🔌 Backend Connection Failed</p>
              <p className="text-xs text-red-600 mt-1">
                Error: {'data' in error ? (error.data as any)?.message : 'message' in error ? error.message : 'Connection failed'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                className="mt-2 h-7 text-xs"
              >
                Test Connection
              </Button>
            </div>
          )}
          
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Backend URL:</strong> {config.api.baseURL}/users</p>
            <p><strong>Environment:</strong> {config.app.environment}</p>
            <p><strong>Auth Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
            <p><strong>Token Available:</strong> {authStatus.hasValidToken ? '✅ Yes' : '❌ No'}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all users in the system • Backend Integration Active
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatusIndicator />
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Troubleshooting Panel */}
      <TroubleshootingPanel />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  className="pl-10"
                  value={searchParams.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={searchParams.role} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="rider">Rider</SelectItem>
              </SelectContent>
            </Select>

            <Select value={searchParams.status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <Shield className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Connection Error</p>
                <p className="text-sm text-gray-600">Failed to load users from backend</p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900">No users found</p>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {users.map((user: User) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.profileImage} alt={user.name} />
                              <AvatarFallback>
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user)}>
                            {getStatusText(user)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
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
                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {/* Block/Unblock Actions */}
                                {!user.isBlocked ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleBlockUser(user.id)}
                                    disabled={isBlocking}
                                    className="text-red-600"
                                  >
                                    🚫 Block User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleUnblockUser(user.id)}
                                    disabled={isUnblocking}
                                    className="text-green-600"
                                  >
                                    ✅ Unblock User
                                  </DropdownMenuItem>
                                )}
                                
                                {/* Driver Specific Actions */}
                                {user.role === 'driver' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Driver Actions</DropdownMenuLabel>
                                    
                                    {user.isActive === 'active' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleSuspendDriver(user.id)}
                                        disabled={isSuspending}
                                        className="text-yellow-600"
                                      >
                                        ⏸️ Suspend Driver
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {user.isActive === 'suspended' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleApproveDriver(user.id)}
                                        disabled={isApproving}
                                        className="text-green-600"
                                      >
                                        ✅ Approve Driver
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {user.isActive === 'inactive' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusUpdate(user.id, 'active')}
                                        disabled={isUpdatingStatus}
                                        className="text-blue-600"
                                      >
                                        🟢 Activate Driver
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser)}>
                      {getStatusText(selectedUser)}
                    </Badge>
                    {selectedUser.emailVerified && (
                      <Badge className="bg-blue-100 text-blue-800">
                        ✅ Email Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <span>ID: {selectedUser.id || selectedUser._id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span>Status: {selectedUser.isBlocked ? 'Blocked' : selectedUser.isActive}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>Email Verified: {selectedUser.emailVerified ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    {selectedUser.lastLogin && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Last Login: {new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;