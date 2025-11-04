/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUploadAdminProfileImageMutation,
} from '@/redux/features/admin/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast, Toaster } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Bell,
  Lock,
  Settings,
  Save,
  Edit,
  Camera,
  Loader2,
} from 'lucide-react';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
  weekly_reports: boolean;
  ride_alerts: boolean;
  system_updates: boolean;
}

interface DashboardPrefs {
  default_view: 'analytics' | 'rides' | 'users';
  auto_refresh: boolean;
  dark_mode: boolean;
}

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profileResponse, isLoading, isError } = useGetAdminProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateAdminProfileMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadAdminProfileImageMutation();

  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    sms: false,
    push: true,
    weekly_reports: true,
    ride_alerts: true,
    system_updates: false,
  });

  const [] = useState<DashboardPrefs>({
    default_view: 'analytics',
    auto_refresh: true,
    dark_mode: false,
  });

  // Normalise admin object from the API response
    const admin = ((resp: any) => {
      if (!resp) return resp;
      if (resp.data?.admin) return resp.data.admin;
      if (resp.admin) return resp.admin;
      return resp;
    })(profileResponse);

  // Populate form when admin data arrives
  useEffect(() => {
    if (!admin) return;

    setForm({
      firstName: admin.firstName ?? '',
      lastName: admin.lastName ?? '',
      email: admin.email ?? '',
      phone: admin.phone ?? '',
      address: admin.address ?? '',
    });
  }, [admin]);

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const payload: Partial<ProfileForm> = {
        firstName: form.firstName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (form.lastName.trim()) payload.lastName = form.lastName.trim();

      await updateProfile(payload).unwrap();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      await uploadImage(formData).unwrap();
      toast.success('Profile picture updated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload image');
    }
  };

  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Admin User';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joinDate = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !admin) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load admin profile. Please try again later.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600">Manage your profile, security, and preferences</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
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
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={form.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={form.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div> */}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Change Password</div>
                          <div className="text-sm text-gray-500">Update your account password</div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Lock className="mr-2 h-4 w-4" />
                          Change
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Two‑Factor Authentication</div>
                          <div className="text-sm text-gray-500">Extra security layer</div>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Active Sessions</div>
                          <div className="text-sm text-gray-500">Manage logged‑in devices</div>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you receive updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-500">
                            {key === 'email' && 'Via email'}
                            {key === 'sms' && 'Text message'}
                            {key === 'push' && 'Browser push'}
                            {key === 'weekly_reports' && 'Weekly summary'}
                            {key === 'ride_alerts' && 'Real‑time ride updates'}
                            {key === 'system_updates' && 'Maintenance alerts'}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Profile Card */}
          <div>
            <Card>
              <CardHeader className="text-center pb-6">
                <div className="relative mx-auto w-fit">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={admin.profilePicture || ''} alt={fullName} />
                    <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 rounded-full p-0"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                    </label>
                  )}
                </div>
                <CardTitle className="mt-4">{fullName}</CardTitle>
                <CardDescription>{admin.role || 'Administrator'}</CardDescription>
                <Badge className="mt-2">{admin.department || 'Admin'}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{form.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{form.phone || 'Not set'}</span>
                  </div>
                  {/* <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{form.address || 'Not set'}</span>
                  </div> */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>ID: {admin.id || admin._id}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sonner Toaster – you can also move this to your root layout */}
      <Toaster position="top-right" richColors />
    </>
  );
}