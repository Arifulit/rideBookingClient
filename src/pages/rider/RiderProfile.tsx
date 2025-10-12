import { useEffect, useState } from 'react';
import { useGetProfileQuery } from '@/redux/features/user/user.api';
import { useUpdateRiderProfileMutation } from '@/redux/features/rider/riderApi';
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
  Car,
  Star,
  DollarSign,
  CreditCard,
  Shield,
  Settings,
  Save,
  Edit,
  Camera,
  Plus
} from 'lucide-react';

const RiderProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profileWrapper, isLoading: profileLoading, isError: profileError, refetch } = useGetProfileQuery(undefined);
  const [updateProfile] = useUpdateRiderProfileMutation();

  const [profileData, setProfileData] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredPayment: ''
  }));

  const [stats] = useState({
    totalRides: 47,
    avgRating: 4.9,
    totalSpent: 1245.75,
    savedLocations: 3,
    completedRides: 45,
    carbonSaved: 125.5 // kg CO2
  });

  const [paymentMethods] = useState([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
    { id: '2', type: 'card', last4: '8888', brand: 'Mastercard', isDefault: false },
    { id: '3', type: 'wallet', name: 'RideWallet', balance: 25.50, isDefault: false }
  ]);

  const [savedLocations] = useState([
    { id: '1', name: 'Home', address: '123 Rider Street, City, State 12345' },
    { id: '2', name: 'Work', address: '456 Business Ave, Downtown, State 12345' },
    { id: '3', name: 'Gym', address: '789 Fitness Blvd, Uptown, State 12345' }
  ]);

  const handleSave = async () => {
    try {
      console.debug('Submitting profile update', profileData);
      console.debug('Outgoing PATCH /users/profile payload:', profileData);
      const res = await updateProfile(profileData).unwrap();
      console.debug('updateProfile response:', res);
      setIsEditing(false);
      console.debug('Profile update successful (client)');
      await refetch();
    } catch (err) {
      console.error('Profile update failed', err);
      try {
        console.error('Profile update error (details):', JSON.stringify(err, null, 2));
      } catch (jsonErr) {
        console.warn('Failed to stringify profile update error', jsonErr);
      }
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

  // initialize local state from fetched profile
  useEffect(() => {
    const user = profileWrapper?.user || profileWrapper;
    if (user) {
      console.debug('Loaded rider profile from API', user);
      setProfileData({
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        address: user.address || '',
        joinDate: user.createdAt || user.joinDate || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        preferredPayment: user.preferredPayment || ''
      });
    }
  }, [profileWrapper]);

  // Debug: log raw query state to help diagnose missing profile data
  useEffect(() => {
    console.debug('RiderProfile - query state', {
      profileWrapper,
      profileLoading,
      profileError,
    });
  }, [profileWrapper, profileLoading, profileError]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your rider profile and preferences</p>
        </div>
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="ghost" onClick={() => { refetch(); }}>
              Refresh
            </Button>
          </div>
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
  {profileError && <div className="text-red-600">Failed to load profile. Check console for details.</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRides}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Places</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedLocations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedRides}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.carbonSaved}kg</div>
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
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="locations">Saved Locations</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and emergency contact
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
                      <Label htmlFor="preferred-payment">Preferred Payment</Label>
                      <Input
                        id="preferred-payment"
                        value={profileData.preferredPayment}
                        onChange={(e) => handleInputChange('preferredPayment', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Home Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency-name">Contact Name</Label>
                        <Input
                          id="emergency-name"
                          value={profileData.emergencyContactName}
                          onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency-phone">Contact Phone</Label>
                        <Input
                          id="emergency-phone"
                          value={profileData.emergencyContactPhone}
                          onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>
                        Manage your payment methods and wallet
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {method.type === 'card' ? (
                              <>
                                {method.brand} ****{method.last4}
                                {method.isDefault && (
                                  <Badge className="bg-green-100 text-green-800">Default</Badge>
                                )}
                              </>
                            ) : (
                              <>
                                {method.name}
                                <Badge className="bg-purple-100 text-purple-800">
                                  ${method.balance}
                                </Badge>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {method.type === 'card' ? 'Credit/Debit Card' : 'Digital Wallet'}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {method.isDefault ? 'Edit' : 'Set Default'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Saved Locations</CardTitle>
                      <CardDescription>
                        Quick access to your frequently visited places
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {savedLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-6 w-6 text-gray-400" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-500">{location.address}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
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
              <CardDescription>Verified Rider</CardDescription>
              <div className="flex justify-center items-center gap-1 mt-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{stats.avgRating}</span>
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
                  Account Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy & Safety
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Frequent Rider</div>
                    <div className="text-xs text-gray-500">25+ rides completed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Safety First</div>
                    <div className="text-xs text-gray-500">High safety rating</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Eco Warrior</div>
                    <div className="text-xs text-gray-500">100kg+ CO₂ saved</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;