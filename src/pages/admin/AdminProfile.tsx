import { useEffect, useState } from 'react';
import { useGetProfileQuery, useUpdateMyProfileMutation } from '@/redux/features/user/user.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Lock,
  Settings,
  Save,
  Edit,
  Camera
} from 'lucide-react';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profileWrapper, isLoading: profileLoading, isError: profileError, refetch } = useGetProfileQuery(undefined);
  const [updateMyProfile] = useUpdateMyProfileMutation();

  const [profileData, setProfileData] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    department: '',
    employeeId: '',
    role: ''
  }));

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      weekly_reports: true,
      ride_alerts: true,
      system_updates: false
    },
    dashboard: {
      default_view: 'analytics',
      auto_refresh: true,
      dark_mode: false
    }
  });

  const handleSave = async () => {
    try {
      console.debug('Submitting admin profile update', profileData);
      // Debug helpers: log stored tokens and exact payload
      try {
        console.debug('LocalStorage accessToken:', localStorage.getItem('accessToken'));
        console.debug('LocalStorage refreshToken:', localStorage.getItem('refreshToken'));
      } catch (e) {
        console.debug('Could not read localStorage tokens', e);
      }
      // send full editable profile to backend so all fields can be updated
      const payload: Record<string, unknown> = { ...profileData };

      // If the UI stores a combined `name`, split into firstName/lastName when possible
      if (profileData.name) {
        const parts = profileData.name.trim().split(/\s+/);
        if (parts.length === 1) {
          payload.firstName = parts[0];
        } else if (parts.length >= 2) {
          payload.firstName = parts.shift();
          payload.lastName = parts.join(' ');
        }
      }

      // Send the full payload; backend should apply partial updates from PATCH
      console.debug('Outgoing PATCH /users/profile payload:', payload);
      const res = await updateMyProfile(payload).unwrap();
      console.debug('updateMyProfile response:', res);
      setIsEditing(false);
      console.debug('Admin profile updated (client-side)');
      // Refresh profile data after successful update
      try {
        await refetch();
      } catch (refetchErr) {
        console.warn('Refetch after profile update failed', refetchErr);
      }
    } catch (err) {
      console.error('Admin profile update failed', err);
      // If RTK Query returned a structured error payload, log details
      try {
        // err might be a serialized error returned by axiosBaseQuery
        console.error('Update error details:', JSON.stringify(err, null, 2));
      } catch (jsonErr) {
        console.error('Could not stringify update error', jsonErr);
      }
    }
  };

  const handleCancel = () => {
    // Reset any changes and exit edit mode
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const user = profileWrapper && (profileWrapper.user || profileWrapper);
    if (user) {
      console.debug('Loaded admin profile from API', user);
      setProfileData({
        name: `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        department: user.department || user.role || '',
        employeeId: user.employeeId || user.employee_id || user.id || user._id || '',
        role: user.role || ''
      });
    }
  }, [profileWrapper]);

  const adminStats = [
    { label: 'Users Managed', value: '12,543', icon: <User className="h-4 w-4" /> },
    { label: 'Rides Monitored', value: '45,231', icon: <MapPin className="h-4 w-4" /> },
    { label: 'Reports Generated', value: '156', icon: <Calendar className="h-4 w-4" /> },
    { label: 'System Uptime', value: '99.9%', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">Manage your administrative profile and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

  {/* Stats Cards */}
  {profileLoading && <div>Loading profile...</div>}
  {profileError && <div className="text-red-600">Failed to load admin profile. Check console for details.</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className="text-muted-foreground">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Change Password</div>
                        <div className="text-sm text-gray-500">Update your account password</div>
                      </div>
                      <Button variant="outline">
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-500">Add an extra layer of security</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Login Sessions</div>
                        <div className="text-sm text-gray-500">Manage your active sessions</div>
                      </div>
                      <Button variant="outline">View Sessions</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">
                            {key.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {key === 'email' && 'Receive notifications via email'}
                            {key === 'sms' && 'Receive notifications via SMS'}
                            {key === 'push' && 'Receive push notifications'}
                            {key === 'weekly_reports' && 'Weekly performance reports'}
                            {key === 'ride_alerts' && 'Real-time ride alerts'}
                            {key === 'system_updates' && 'System maintenance updates'}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [key]: e.target.checked
                            }
                          }))}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Profile Card */}
        <div>
          <Card>
            <CardHeader className="text-center pb-6">
              <div className="relative mx-auto">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src="/api/placeholder/96/96" alt={profileData.name} />
                  <AvatarFallback className="text-lg">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{profileData.name}</CardTitle>
              <CardDescription>{profileData.role}</CardDescription>
              <Badge className="bg-blue-100 text-blue-800 mt-2">
                {profileData.department}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{profileData.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Joined {profileData.joinDate}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>ID: {profileData.employeeId}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Center
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;