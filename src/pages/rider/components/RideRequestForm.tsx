/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Navigation, 
  Clock, 
  CreditCard, 
  Users, 
  MessageSquare,
  ArrowUpDown,
  Car,
  Crown,
  Gem
} from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  useGetFareEstimationMutation,
  useLazyGetCurrentLocationQuery,
  useRequestRideMutation
} from '@/redux/features/rider/riderApi';

import {
  setPickupLocation,
  setDestinationLocation,
  setRideType,
  setPaymentMethod,
  setPassengers,
  setNotes,
  swapLocations
} from '@/redux/features/rider/riderSlice';

import type { RootState } from '@/redux/store';
import type { Location } from '@/types/rider';
import FareEstimationCard from './FareEstimationCard';
import LocationSearch from './LocationSearch';

// Form validation schema
const rideRequestSchema = z.object({
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
  rideType: z.enum(['economy', 'premium', 'luxury']),
  scheduledTime: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'wallet']),
  passengers: z.number().min(1).max(4),
  notes: z.string().optional(),
});

type RideRequestFormData = z.infer<typeof rideRequestSchema>;

const rideTypeOptions = [
  {
    value: 'economy',
    label: 'Economy',
    icon: Car,
    description: 'Affordable rides for everyday travel',
    color: 'bg-blue-500',
  },
  {
    value: 'premium',
    label: 'Premium',
    icon: Crown,
    description: 'Comfortable rides with extra space',
    color: 'bg-purple-500',
  },
  {
    value: 'luxury',
    label: 'Luxury',
    icon: Gem,
    description: 'High-end vehicles for special occasions',
    color: 'bg-gold-500',
  },
] as const;

interface RideRequestFormProps {
  onSuccess?: (rideId: string) => void;
  className?: string;
}

export function RideRequestForm({ onSuccess, className = '' }: RideRequestFormProps) {
  const dispatch = useDispatch();
  const riderState = useSelector((state: RootState) => state.rider);
  
  // use mutation to request a single fare estimation from server
  const [getFareEstimation, { data: fareEstimation, isLoading: fareLoading }] = useGetFareEstimationMutation();
  const [, { isLoading: locationLoading }] = useLazyGetCurrentLocationQuery();
  const [requestRide] = useRequestRideMutation();
  // we'll POST directly to the backend endpoint and manage local submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { data: paymentMethods } = useGetPaymentMethodsQuery();

  const [showScheduleTime, setShowScheduleTime] = useState(false);
  const [selectedRideType, setSelectedRideType] = useState<'economy' | 'premium' | 'luxury'>('economy');

  const { control, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<RideRequestFormData>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      rideType: 'economy',
      paymentMethod: 'cash',
      passengers: 1,
      notes: '',
    },
  });

  const pickupLocation = watch('pickupLocation');
  const destinationLocation = watch('destinationLocation');
  const currentRideType = watch('rideType');

  // Get fare estimation when locations or ride type change
  useEffect(() => {
    if (pickupLocation && destinationLocation) {
      // call mutation to get fare estimation; use the API's expected keys
      (async () => {
        try {
          await getFareEstimation({
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
            rideType: selectedRideType,
          }).unwrap();
        } catch {
          // ignore estimation errors; UI will show nothing
        }
      })();
    }
  }, [pickupLocation, destinationLocation, getFareEstimation, selectedRideType]);

  // Sync with Redux state
  useEffect(() => {
    if (riderState.rideRequest.pickupLocation) {
      setValue('pickupLocation', riderState.rideRequest.pickupLocation);
    }
    if (riderState.rideRequest.destinationLocation) {
      setValue('destinationLocation', riderState.rideRequest.destinationLocation);
    }
  }, [riderState.rideRequest, setValue]);

  const handleLocationSelect = (location: Location, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setValue('pickupLocation', location);
      dispatch(setPickupLocation(location));
    } else {
      setValue('destinationLocation', location);
      dispatch(setDestinationLocation(location));
    }
  };

  const handleSwapLocations = () => {
    dispatch(swapLocations());
    const temp = pickupLocation;
    setValue('pickupLocation', destinationLocation);
    setValue('destinationLocation', temp);
  };

    const handleUseCurrentLocation = async () => {
    try {
      // Get current location from geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            dispatch(setPickupLocation({
              address: 'Current Location',
              latitude,
              longitude
            }));
            toast.success('Using current location as pickup point');
          },
          () => {
            toast.error('Failed to get current location');
          }
        );
      } else {
        toast.error('Geolocation is not supported');
      }
    } catch {
      toast.error('Failed to get current location');
    }
  };

  const handleRideTypeChange = (rideType: 'economy' | 'premium' | 'luxury') => {
    setSelectedRideType(rideType);
    setValue('rideType', rideType);
    dispatch(setRideType(rideType));
  };

  const formatLocationToGeo = (loc: { address: string; latitude?: number; longitude?: number }) => {
    return {
      address: loc.address || 'Unknown',
      coordinates: {
        type: 'Point',
        // GeoJSON uses [longitude, latitude]
        coordinates: [loc.longitude ?? 0, loc.latitude ?? 0],
      },
    };
  };

  const onSubmit = async (data: RideRequestFormData) => {
    if (!data.pickupLocation || !data.destinationLocation) {
      toast.error('Please provide pickup and destination locations');
      return;
    }

    const payload = {
      pickupLocation: formatLocationToGeo(data.pickupLocation),
      destinationLocation: formatLocationToGeo(data.destinationLocation),
      rideType: data.rideType,
      paymentMethod: data.paymentMethod,
      passengers: data.passengers,
      notes: data.notes || '',
      scheduledTime: data.scheduledTime || null,
    };

    try {
      setIsSubmitting(true);
    // call RTK Query mutation (assumes server returns created ride object)
      const result = await requestRide(payload as any).unwrap();
      toast.success('Ride requested successfully!');
      onSuccess?.(result.id || result._id || result.rideId || '');
      } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Failed to create ride request';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFareEstimation = fareEstimation && fareEstimation.rideType === currentRideType ? fareEstimation : undefined;

  return (
    <motion.div 
      className={`max-w-2xl mx-auto space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <Car className="h-6 w-6" />
            Request a Ride
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Location Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Locations</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    {locationLoading ? 'Getting Location...' : 'Use Current'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSwapLocations}
                    disabled={!pickupLocation || !destinationLocation}
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Pickup Location
                </Label>
                <Controller
                  name="pickupLocation"
                  control={control}
                  render={({ field }) => (
                    <LocationSearch
                      value={field.value}
                      onChange={(location) => handleLocationSelect(location, 'pickup')}
                      placeholder="Enter pickup location"
                      recentLocations={riderState.recentPickupLocations}
                    />
                  )}
                />
                {errors.pickupLocation && (
                  <p className="text-sm text-destructive">{errors.pickupLocation.message}</p>
                )}
              </div>

              {/* Destination Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  Destination
                </Label>
                <Controller
                  name="destinationLocation"
                  control={control}
                  render={({ field }) => (
                    <LocationSearch
                      value={field.value}
                      onChange={(location) => handleLocationSelect(location, 'destination')}
                      placeholder="Where to?"
                      recentLocations={riderState.recentDestinations}
                    />
                  )}
                />
                {errors.destinationLocation && (
                  <p className="text-sm text-destructive">{errors.destinationLocation.message}</p>
                )}
              </div>
            </div>

            {/* Ride Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Choose Ride Type</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rideTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedRideType === option.value;
                  
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? 'ring-2 ring-primary border-primary bg-accent' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleRideTypeChange(option.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${option.color} text-white mb-3`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          
                          <h4 className="font-semibold text-foreground">{option.label}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                          
                          {currentFareEstimation && isSelected && (
                            <Badge variant="secondary" className="mt-2">
                              ${currentFareEstimation.total.toFixed(2)}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Fare Estimation */}
            <AnimatePresence>
              {currentFareEstimation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FareEstimationCard 
                    estimation={currentFareEstimation} 
                    isLoading={fareLoading} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Additional Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Passengers */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Passengers
                </Label>
                <Controller
                  name="passengers"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newValue = Math.max(1, field.value - 1);
                          field.onChange(newValue);
                          dispatch(setPassengers(newValue));
                        }}
                        disabled={field.value <= 1}
                      >
                        -
                      </Button>
                      
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="4"
                        className="text-center w-20"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          field.onChange(value);
                          dispatch(setPassengers(value));
                        }}
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newValue = Math.min(4, field.value + 1);
                          field.onChange(newValue);
                          dispatch(setPassengers(newValue));
                        }}
                        disabled={field.value >= 4}
                      >
                        +
                      </Button>
                    </div>
                  )}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </Label>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="input-field w-full px-3 py-2 rounded-lg"
                      onChange={(e) => {
                        const value = e.target.value as 'cash' | 'card' | 'wallet';
                        field.onChange(value);
                        dispatch(setPaymentMethod(value));
                      }}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="wallet">Digital Wallet</option>
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Schedule Time (Optional) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="scheduleRide"
                  checked={showScheduleTime}
                  onChange={(e) => setShowScheduleTime(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="scheduleRide" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule for later
                </Label>
              </div>

              <AnimatePresence>
                {showScheduleTime && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Controller
                      name="scheduledTime"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                          className="input-field"
                        />
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Special Instructions (Optional)
              </Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Any special requests or instructions for the driver..."
                    className="input-field resize-none"
                    rows={3}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      dispatch(setNotes(e.target.value));
                    }}
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="btn-primary w-full py-4 text-lg font-semibold"
              disabled={!isValid || isSubmitting || !pickupLocation || !destinationLocation}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Requesting Ride...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Request Ride
                  {currentFareEstimation && (
                    <Badge variant="secondary" className="ml-2">
                      ${currentFareEstimation.total.toFixed(2)}
                    </Badge>
                  )}
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RideRequestForm;