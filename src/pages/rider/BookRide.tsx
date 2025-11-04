/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

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
import {
  useGetFareEstimationMutation,
  useRequestRideMutation,
} from '@/redux/features/rider/riderApi';
import { toast } from 'sonner';

type Location = {
  address: string;
  latitude: number;
  longitude: number;
};

const predefinedLocations: Location[] = [
  { address: '123 Main St, City', latitude: 40.7128, longitude: -74.006 },
  { address: '456 Oak Ave, City', latitude: 40.7589, longitude: -74.012 },
  { address: '789 Pine Rd, City', latitude: 40.7306, longitude: -73.9352 },
  { address: '101 Maple Dr, City', latitude: 40.7484, longitude: -73.9857 },
  { address: '321 Elm St, City', latitude: 40.7769, longitude: -73.9742 },
];

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
  paymentMethod: z.enum(['cash', 'card', 'wallet'] as const, {
    error: 'Please select a payment method',
  }),
});

type BookRideFormData = z.infer<typeof bookRideSchema>;

const BookRide: React.FC = () => {
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [priorityRide, setPriorityRide] = useState(false);
  const [silentRide, setSilentRide] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'wallet'>('cash');

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
    },
  });

  const pickupLocation = watch('pickupLocation');
  const destinationLocation = watch('destinationLocation');

  const getRandomLocation = (exclude?: Location): Location => {
    let selected: Location;
    do {
      selected = predefinedLocations[Math.floor(Math.random() * predefinedLocations.length)];
    } while (exclude && selected.address === exclude.address);
    return selected;
  };

  useEffect(() => {
    const randomPickup = getRandomLocation();
    const randomDestination = getRandomLocation(randomPickup);
    setValue('pickupLocation', randomPickup);
    setValue('destinationLocation', randomDestination);
  }, [setValue]);

   const handleRandomizeLocations = () => {
    const randomPickup = getRandomLocation();
    const randomDestination = getRandomLocation(randomPickup);
    setValue('pickupLocation', randomPickup);
    setValue('destinationLocation', randomDestination);
    toast.info('New random locations selected!');
  };

  // Fare Estimation
  useEffect(() => {
    if (!pickupLocation || !destinationLocation) {
      setEstimatedFare(null);
      return;
    }

    const estimate = async () => {
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

        if (typeof res?.total === 'number') {
          setEstimatedFare(res.total);
        }
      } catch {
        setEstimatedFare(null);
      }
    };

    estimate();
  }, [pickupLocation, destinationLocation, getFareEstimation]);


  // Submit Handler — always show success toast, do not display error toasts
  const onSubmit = async (data: BookRideFormData) => {
    if (!data.pickupLocation || !data.destinationLocation) {
      toast.error('Please select both pickup and destination');
      return;
    }

    const toPoint = (loc: Location): [number, number] => [loc.longitude, loc.latitude];

    const rideRequest = {
      pickupLocation: {
        address: data.pickupLocation.address,
        latitude: data.pickupLocation.latitude,
        longitude: data.pickupLocation.longitude,
        coordinates: { type: 'Point' as const, coordinates: toPoint(data.pickupLocation) },
      },
      destinationLocation: {
        address: data.destinationLocation.address,
        latitude: data.destinationLocation.latitude,
        longitude: data.destinationLocation.longitude,
        coordinates: { type: 'Point' as const, coordinates: toPoint(data.destinationLocation) },
      },
      rideType: 'economy' as const,
      paymentMethod: data.paymentMethod,
      notes: '',
    };

    // Immediately show success message (user requested)
    toast.success('Ride Requested Successfully');

    // Show loading state briefly
    setIsLoading(true);

    // Fire-and-forget request: send to backend but don't show error toasts
    requestRide(rideRequest)
      .unwrap()
      .then((res: any) => {
        // Optional: if backend returns rideId, navigate to it; otherwise go to rides list
        const rideId =
          res?.data?.ride?.id ||
          res?.data?.ride?._id ||
          res?.data?._id ||
          res?.id ||
          res?._id ||
          null;

        navigate(rideId ? `/rider/rides/${rideId}` : '/rider/rides');
      })
      .catch((err: any) => {
        // Silent failure: log for debugging but do not show any toast to the user
        console.error('Background ride request failed:', err);
        navigate('/rider/rides/history'); // still navigate to rides history
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const paymentOptions = [
    {
      value: 'cash' as const,
      label: 'Cash Payment',
      icon: Banknote,
      description: 'Pay with cash upon arrival',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      value: 'card' as const,
      label: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Secure card payment',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      value: 'wallet' as const,
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Book Your Ride
          </h1>
          <p className="text-xl text-gray-600">Quick and easy ride booking!</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <span>Ride Details</span>
              </h2>
              <button
                type="button"
                onClick={handleRandomizeLocations}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Randomize Locations</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Locations */}
              <div className="grid md:grid-cols-2 gap-6">
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
                        <input
                          type="text"
                          value={field.value?.address || ''}
                          readOnly
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
                          placeholder="Random pickup location"
                        />
                      )}
                    />
                    <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-600" />
                  </div>
                  {errors.pickupLocation?.address && (
                    <p className="text-sm text-red-600">Warning: {errors.pickupLocation.address.message}</p>
                  )}
                </div>

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
                        <input
                          type="text"
                          value={field.value?.address || ''}
                          readOnly
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
                          placeholder="Random destination"
                        />
                      )}
                    />
                    <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-red-600" />
                  </div>
                  {errors.destinationLocation?.address && (
                    <p className="text-sm text-red-600">Warning: {errors.destinationLocation.address.message}</p>
                  )}
                </div>
              </div>

              {/* Fare */}
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
                      <div className="text-4xl font-bold text-green-900">
                        ${estimatedFare.toFixed(2)}
                      </div>
                      <p className="text-sm text-green-700">+ taxes & fees</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-100 rounded-xl p-3">
                    <Star className="h-4 w-4" />
                    <span>Estimate may vary based on traffic and route.</span>
                  </div>
                </div>
              )}

              {/* Payment */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Choose Payment Method</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedPayment === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedPayment(option.value);
                          setValue('paymentMethod', option.value);
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-xl'
                            : 'border-gray-200 bg-white/50 hover:border-blue-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${option.gradient}`}>
                            <Icon className="h-6 w-6 text-white" />
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
                  <p className="text-sm text-red-600">Warning: {errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Preferences */}
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
                      priorityRide
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-orange-300'
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
                      silentRide
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300'
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
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