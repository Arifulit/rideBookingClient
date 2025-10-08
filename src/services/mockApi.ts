// Mock API for testing without backend
import { v4 as uuidv4 } from 'uuid';

interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'rider' | 'driver';
  licenseNumber?: string;
  vehicleInfo?: VehicleInfo;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'rider' | 'driver';
  licenseNumber?: string;
  vehicleInfo?: VehicleInfo;
  createdAt: string;
}

interface RideData {
  pickupLocation: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  rideType: string;
  paymentMethod: string;
}

interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickupLocation: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  rideType: string;
  paymentMethod: string;
  status: string;
  fare?: number;
  createdAt: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock storage functions
const getUsers = () => {
  const users = localStorage.getItem('mockUsers');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

// Initialize with some sample data if no rides exist
const initializeSampleRides = () => {
  const existingRides = localStorage.getItem('mockRides');
  if (!existingRides || JSON.parse(existingRides).length === 0) {
    const sampleRides = [
      {
        id: uuidv4(),
        riderId: 'sample-rider-1',
        driverId: null,
        pickupLocation: {
          address: 'Dhaka University, Dhaka',
          latitude: 23.7279,
          longitude: 90.3981
        },
        destination: {
          address: 'Gulshan Circle 1, Dhaka',
          latitude: 23.7806,
          longitude: 90.4193
        },
        rideType: 'standard',
        status: 'pending',
        paymentMethod: 'cash',
        fare: 150,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: uuidv4(),
        riderId: 'sample-rider-2',
        driverId: 'sample-driver-1',
        pickupLocation: {
          address: 'Bashundhara City, Dhaka',
          latitude: 23.7508,
          longitude: 90.3915
        },
        destination: {
          address: 'New Market, Dhaka',
          latitude: 23.7341,
          longitude: 90.3840
        },
        rideType: 'premium',
        status: 'completed',
        paymentMethod: 'card',
        fare: 200,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      }
    ];
    localStorage.setItem('mockRides', JSON.stringify(sampleRides));
  }
};

export const mockAuthAPI = {
  register: async (userData: RegisterData) => {
    await delay(1000); // Simulate network delay

    const users = getUsers();
    
    // Check if email already exists
    const existingUser = users.find((user: User) => user.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      ...userData,
      password: undefined, // Don't store password
      createdAt: new Date().toISOString(),
      isApproved: userData.role === 'rider', // Auto-approve riders, drivers need approval
    };

    users.push({ ...newUser, password: userData.password }); // Store password for login
    saveUsers(users);

    // Generate mock token
    const token = `mock_token_${newUser.id}`;

    return {
      success: true,
      message: 'Registration successful',
      user: newUser,
      token,
    };
  },

  login: async (credentials: LoginData) => {
    await delay(800); // Simulate network delay

    const users = getUsers();
    
    const user = users.find(
      (u: User) => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate mock token
    const token = `mock_token_${user.id}`;

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    };
  },
};

export const mockRideAPI = {
  requestRide: async (rideData: RideData) => {
    await delay(1000);
    
    const ride = {
      id: uuidv4(),
      ...rideData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const rides = JSON.parse(localStorage.getItem('mockRides') || '[]');
    rides.push(ride);
    localStorage.setItem('mockRides', JSON.stringify(rides));

    return {
      success: true,
      message: 'Ride requested successfully',
      ride,
    };
  },

  getRides: async () => {
    await delay(500);
    
    // Initialize sample data if needed
    initializeSampleRides();
    
    const rides = JSON.parse(localStorage.getItem('mockRides') || '[]');
    return rides; // Direct array return to match expected format
  },

  acceptRide: async (rideId: string) => {
    await delay(800);
    
    const rides = JSON.parse(localStorage.getItem('mockRides') || '[]');
    const rideIndex = rides.findIndex((r: Ride) => r.id === rideId);
    
    if (rideIndex === -1) {
      throw new Error('Ride not found');
    }

    rides[rideIndex].status = 'accepted';
    localStorage.setItem('mockRides', JSON.stringify(rides));

    return {
      success: true,
      message: 'Ride accepted',
      ride: rides[rideIndex],
    };
  },

  updateRideStatus: async (rideId: string, status: string) => {
    await delay(500);
    
    const rides = JSON.parse(localStorage.getItem('mockRides') || '[]');
    const rideIndex = rides.findIndex((r: Ride) => r.id === rideId);
    
    if (rideIndex === -1) {
      throw new Error('Ride not found');
    }

    rides[rideIndex].status = status;
    localStorage.setItem('mockRides', JSON.stringify(rides));

    return {
      success: true,
      message: 'Ride status updated',
      ride: rides[rideIndex],
    };
  },
};