import { useEffect, useState } from 'react';
import { useGetProfileQuery } from '@/redux/features/user/user.api';
import { useUpdateDriverProfileMutation } from '@/redux/features/driver/driverApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Car,
  Star,
  DollarSign,
  Clock,
  Shield,
  Settings,
  Save,
  Edit,
  Camera
} from 'lucide-react';

const DriverProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profileWrapper, isLoading: profileLoading, isError: profileError, refetch } = useGetProfileQuery(undefined);
  const [updateProfile] = useUpdateDriverProfileMutation();

  const [profileData, setProfileData] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    vehicleColor: ''
  }));

  const [stats] = useState({
    totalRides: 1247,
    rating: 4.8,
    totalEarnings: 15420.50,
    completionRate: 98.5,
    responseTime: '2.3 min',
    activeHours: '156 hrs'
  });

  const handleSave = async () => {
    try {
      console.debug('Submitting driver profile update', profileData);
      await updateProfile(profileData).unwrap();
      setIsEditing(false);
      console.debug('Driver profile updated');
      refetch();
    } catch (err) {
      console.error('Driver profile update failed', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const user = profileWrapper?.user || profileWrapper;
    if (user) {
      console.debug('Loaded driver profile from API', user);
      setProfileData({
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        joinDate: user.createdAt || user.joinDate || '',
        licenseNumber: user.licenseNumber || '',
        licenseExpiry: user.licenseExpiry || '',
        vehicleMake: user.vehicle?.make || user.vehicleMake || '',
        vehicleModel: user.vehicle?.model || user.vehicleModel || '',
        vehicleYear: user.vehicle?.year || user.vehicleYear || '',
        vehiclePlate: user.vehicle?.plate || user.vehiclePlate || '',
        vehicleColor: user.vehicle?.color || user.vehicleColor || ''
      });
    }
  }, [profileWrapper]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Profile</h1>
          <p className="text-gray-600">Manage your driver profile and vehicle information</p>
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
  {profileError && <div className="text-red-600">Failed to load driver profile. Check console for details.</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRides.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hours</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeHours}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="vehicle">Vehicle Info</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
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
                      <Label htmlFor="license">License Number</Label>
                      <Input
                        id="license"
                        value={profileData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
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

            <TabsContent value="vehicle">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                  <CardDescription>
                    Manage your vehicle details and registration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Vehicle Make</Label>
                      <Input
                        id="make"
                        value={profileData.vehicleMake}
                        onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Vehicle Model</Label>
                      <Input
                        id="model"
                        value={profileData.vehicleModel}
                        onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        value={profileData.vehicleYear}
                        onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={profileData.vehicleColor}
                        onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate">License Plate</Label>
                    <Input
                      id="plate"
                      value={profileData.vehiclePlate}
                      onChange={(e) => handleInputChange('vehiclePlate', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Verification</CardTitle>
                  <CardDescription>
                    Manage your documents and verification status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Driver's License</div>
                        <div className="text-sm text-gray-500">Expires: {profileData.licenseExpiry}</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Vehicle Registration</div>
                        <div className="text-sm text-gray-500">Updated 3 months ago</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Insurance Certificate</div>
                        <div className="text-sm text-gray-500">Valid until Dec 2024</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Background Check</div>
                        <div className="text-sm text-gray-500">Completed 6 months ago</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Clear</Badge>
                    </div>
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
              <CardDescription>Professional Driver</CardDescription>
              <div className="flex justify-center items-center gap-1 mt-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{stats.rating}</span>
                <span className="text-sm text-gray-500">({stats.totalRides} rides)</span>
              </div>
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
                  <Car className="h-4 w-4 text-gray-400" />
                  <span>{profileData.vehicleYear} {profileData.vehicleMake} {profileData.vehicleModel}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{profileData.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Member since {profileData.joinDate}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Driver Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Safety Center
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Earnings Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;