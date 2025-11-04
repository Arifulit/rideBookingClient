/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, DollarSign, Clock, Edit2, Save, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { useGetProfileQuery, useUpdateMyProfileMutation } from "@/redux/features/user/user.api";
import { useNavigate } from 'react-router-dom';

const RiderProfile = () => {
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, isError, refetch } = useGetProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Extract data from API response
  const profileData = apiResponse?.rider || null;
  const stats = apiResponse?.stats || { totalCompletedRides: 0, totalSpent: 0 };
  const recentRides = apiResponse?.recentRides || [];

  // Initialize edit form when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || ''
      });
    }
  }, [profileData]);

  const handleEditToggle = () => {
    if (isEditing && profileData) {
      // Reset form to original values
      setEditForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      await updateProfile(editForm).unwrap();
      setIsEditing(false);
      // Show success message (you can add toast notification here)
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Show error message (you can add toast notification here)
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
      'in-transit': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleRideClick = (rideId: string) => {
    navigate(`/rides/${rideId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-lg font-semibold">Failed to load profile</span>
            </div>
            <p className="text-gray-600 mb-4">Unable to fetch profile data. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData.firstName?.[0] || 'R'}{profileData.lastName?.[0] || 'R'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData.fullName || `${profileData.firstName} ${profileData.lastName}`}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profileData.isActive === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profileData.isActive}
                  </span>
                  {profileData.emailVerified && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  )}
                  {profileData.isBlocked && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleEditToggle}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {profileData.fullName || `${profileData.firstName} ${profileData.lastName}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{profileData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{profileData.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(profileData.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(profileData.lastLogin)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ride Statistics</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Rides</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.totalCompletedRides}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Total Spent</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      ৳{stats.totalSpent}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Rides */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Rides</h2>
          {recentRides.length > 0 ? (
            <div className="space-y-4">
              {recentRides.map((ride: any) => (
                <div 
                  key={ride._id || ride.id} 
                  onClick={() => handleRideClick(ride._id || ride.id)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {ride.rideType}
                        </span>
                        {ride.driver && (
                          <span className="text-xs text-gray-500">
                            Driver: {ride.driver.fullName}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-xs text-gray-500">Pickup</p>
                            <p className="text-sm font-medium text-gray-900">
                              {ride.pickupLocation?.address || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-xs text-gray-500">Destination</p>
                            <p className="text-sm font-medium text-gray-900">
                              {ride.destination?.address || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ৳{ride.fare?.estimated || ride.fare?.actual || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {ride.distance?.estimated || ride.distance?.actual || 0} km
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(ride.timeline?.requested || ride.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No rides yet</p>
              <p className="text-sm text-gray-400 mt-1">Your ride history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;