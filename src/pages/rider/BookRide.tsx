
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin,
  CreditCard,
  Wallet,
  Banknote,
  Loader2,
  Navigation,
  Clock,
  Star,
  Shield,
  Volume2,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useGetFareEstimationMutation, useRequestRideMutation } from '@/redux/features/rider/riderApi';
import { toast } from 'sonner';

// Define the Location type
type Location = {
  address: string;
  latitude: number;
  longitude: number;
};

// Predefined list of locations for random selection
const predefinedLocations: Location[] = [
  { address: '123 Main St, City', latitude: 40.7128, longitude: -74.006 },
  { address: '456 Oak Ave, City', latitude: 40.7589, longitude: -74.012 },
  { address: '789 Pine Rd, City', latitude: 40.7306, longitude: -73.9352 },
  { address: '101 Maple Dr, City', latitude: 40.7484, longitude: -73.9857 },
  { address: '321 Elm St, City', latitude: 40.7769, longitude: -73.9742 },
];

// Zod schema for form validation
const bookRideSchema = z.object({
  pickupLocation: z.object({
    address: z.string().min(1, 'Pickup location is required'),
    latitude: z.number(),
    longitude: z.number(),
  }),
  destinationLocation: z.object({
    address: z.string().min(1, 'Destination is required'),
    latitude: z.number(),
    longitude: z.number(),
  }),
  paymentMethod: z.enum(['cash', 'card', 'wallet'], {
    error: 'Please select a payment method',
  }),
});

type BookRideFormData = z.infer<typeof bookRideSchema>;

const BookRide: React.FC = () => {
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [getFareEstimation] = useGetFareEstimationMutation();
  const [requestRide] = useRequestRideMutation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookRideFormData>({
    resolver: zodResolver(bookRideSchema),
    defaultValues: {
      paymentMethod: 'cash',
    } as Partial<BookRideFormData>,
  });

  const pickupLocation = watch('pickupLocation') as Location | undefined;
  const destinationLocation = watch('destinationLocation') as Location | undefined;

  // Function to select a random location, ensuring pickup and destination are different
  const getRandomLocation = (exclude?: Location) => {
    let randomIndex;
    let selectedLocation;
    do {
      randomIndex = Math.floor(Math.random() * predefinedLocations.length);
      selectedLocation = predefinedLocations[randomIndex];
    } while (exclude && selectedLocation.address === exclude.address);
    return selectedLocation;
  };

  // Set random pickup and destination on component mount
  useEffect(() => {
    const randomPickup = getRandomLocation();
    const randomDestination = getRandomLocation(randomPickup);
    setValue('pickupLocation', randomPickup);
    setValue('destinationLocation', randomDestination);
  }, [setValue]);

  // Function to re-randomize locations
  const handleRandomizeLocations = () => {
    const randomPickup = getRandomLocation();
    const randomDestination = getRandomLocation(randomPickup);
    setValue('pickupLocation', randomPickup);
    setValue('destinationLocation', randomDestination);
    toast.info('New random locations selected!');
  };

  // Fetch fare estimation from backend when both locations are present
  useEffect(() => {
    let mounted = true;
    const runEstimation = async () => {
      if (!pickupLocation || !destinationLocation) {
        setEstimatedFare(null);
        return;
      }
      try {
        const res = await getFareEstimation({
          pickup: {
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            address: pickupLocation.address,
          },
          destination: {
            latitude: destinationLocation.latitude,
            longitude: destinationLocation.longitude,
            address: destinationLocation.address,
          },
          rideType: 'economy',
        }).unwrap();
        if (mounted && res && typeof res.total === 'number') setEstimatedFare(res.total);
      } catch {
        if (mounted) setEstimatedFare(null);
      }
    };
    runEstimation();
    return () => {
      mounted = false;
    };
  }, [pickupLocation, destinationLocation, getFareEstimation]);

  const onSubmit = async (data: BookRideFormData) => {
    if (!data.pickupLocation || !data.destinationLocation) {
      toast.error('Please select both pickup and destination locations');
      return;
    }

    const toPoint = (loc: Location) => [loc.longitude, loc.latitude] as [number, number];

    const rideRequest = {
      pickupLocation: {
        address: data.pickupLocation.address,
        latitude: data.pickupLocation.latitude,
        longitude: data.pickupLocation.longitude,
        coordinates: { type: 'Point', coordinates: toPoint(data.pickupLocation) },
      },
      destinationLocation: {
        address: data.destinationLocation.address,
        latitude: data.destinationLocation.latitude,
        longitude: data.destinationLocation.longitude,
        coordinates: { type: 'Point', coordinates: toPoint(data.destinationLocation) },
      },
      rideType: 'economy',
      paymentMethod: data.paymentMethod,
      notes: '',
    };

    try {
      setIsLoading(true);

      // Add optional notes based on preferences
      // (priorityRide and silentRide are in component scope below)
      // Build notes string conditionally
      const notesList: string[] = [];
      if (priorityRide) notesList.push('Priority ride requested');
      if (silentRide) notesList.push('Silent ride requested');
      rideRequest.notes = notesList.join('; ') || 'Call when you arrive';

      // Use RTK Query mutation (prepareHeaders in riderApi will attach token)
      const res = await requestRide(rideRequest as any).unwrap();
      console.log('Ride request response', res);

      // Handle common response shapes
      const success = res?.success ?? (res && typeof res === 'object');
      if (!success || (res?.success === false && !res?.data)) {
        toast.error(res?.message || 'Failed to create ride');
        return;
      }

      toast.success('Ride requested successfully');

      const rideId =
        res?.data?.ride?.id ||
        res?.data?.ride?._id ||
        res?.id ||
        res?._id ||
        null;

      if (rideId) {
        navigate(`/rider/rides/${rideId}`);
      } else {
        navigate('/rider/rides');
      }
    } catch (error: any) {
      console.error('Book ride error:', error);
      const serverMessage = error?.data?.message || error?.message || null;
      const status = error?.status ? ` (${error.status})` : '';
      if (error?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      toast.error(serverMessage ? `${serverMessage}${status}` : 'Failed to book ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'wallet' | null>('cash');
  const [priorityRide, setPriorityRide] = useState(false);
  const [silentRide, setSilentRide] = useState(false);

  const paymentOptions = [
    {
      value: 'cash',
      label: 'Cash Payment',
      icon: Banknote,
      description: 'Pay with cash upon arrival',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      value: 'card',
      label: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Secure card payment',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      value: 'wallet',
      label: 'RideBook Wallet',
      icon: Wallet,
      description: 'Pay from wallet balance',
      gradient: 'from-purple-400 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
            <Navigation className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Book Your Ride</h1>
          <p className="text-xl text-gray-600">Quick and easy ride booking!</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <span>Ride Details</span>
              </h2>
              <button type="button" onClick={handleRandomizeLocations} className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                <RefreshCw className="h-5 w-5" />
                <span>Randomize Locations</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Location Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pickup Location */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Pickup Location</span>
                  </label>
                  <div className="relative">
                    <Controller
                      name="pickupLocation"
                      control={control}
                      render={({ field }) => (
                        <input type="text" value={field.value?.address || ''} readOnly className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800" placeholder="Random pickup location" />
                      )}
                    />
                    <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-600" />
                  </div>
                  {errors.pickupLocation && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.pickupLocation.message}</span>
                    </p>
                  )}
                </div>

                {/* Destination */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span>Destination</span>
                  </label>
                  <div className="relative">
                    <Controller
                      name="destinationLocation"
                      control={control}
                      render={({ field }) => (
                        <input type="text" value={field.value?.address || ''} readOnly className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800" placeholder="Random destination" />
                      )}
                    />
                    <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-red-600" />
                  </div>
                  {errors.destinationLocation && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.destinationLocation.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Fare Estimate */}
              {estimatedFare !== null && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Estimated Fare</h3>
                        <p className="text-green-600">Real-time calculation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-green-900">${estimatedFare}</div>
                      <p className="text-sm text-green-700">+ taxes & fees</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-100 rounded-xl p-3">
                    <Star className="h-4 w-4" />
                    <span>This is an estimate. Final fare may vary based on traffic and route.</span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Choose Payment Method</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {paymentOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedPayment === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedPayment(option.value as 'cash' | 'card' | 'wallet');
                          setValue('paymentMethod', option.value as 'cash' | 'card' | 'wallet');
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${
                          isSelected ? 'border-blue-500 bg-blue-50 shadow-xl' : 'border-gray-200 bg-white/50 hover:border-blue-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${option.gradient}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{option.label}</h4>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm font-medium">Selected</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{errors.paymentMethod.message}</span>
                  </p>
                )}
              </div>

              {/* Ride Preferences */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <span>Ride Preferences</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPriorityRide(!priorityRide)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      priorityRide ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${priorityRide ? 'bg-orange-500' : 'bg-gray-300'}`}>
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Priority Ride</h4>
                          <p className="text-sm text-gray-600">Faster pickup time</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-orange-600">+$2.00</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSilentRide(!silentRide)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      silentRide ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${silentRide ? 'bg-purple-500' : 'bg-gray-300'}`}>
                        <Volume2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Silent Ride</h4>
                        <p className="text-sm text-gray-600">Quiet, peaceful trip</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={false} className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] shadow-xl">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Booking Your Ride...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <span>Book Ride Now</span>
                    {estimatedFare !== null && (
                      <>
                        <span>•</span>
                        <span>${(estimatedFare + (priorityRide ? 2 : 0)).toFixed(2)}</span>
                      </>
                    )}
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRide;