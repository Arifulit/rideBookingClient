
import { MapPin, Navigation, Car } from 'lucide-react';
import type { Location, RideStatus } from '@/types/rider';

interface RideTrackingMapProps {
  pickup: Location;
  destination: Location;
  driverLocation?: Location;
  rideStatus: RideStatus;
  className?: string;
}

export function RideTrackingMap({
  pickup,
  destination,
  driverLocation,
  rideStatus,
  className = ''
}: RideTrackingMapProps) {
  // This is a placeholder component for the map
  // In a real application, you would integrate with Google Maps, Mapbox, or similar
  
  return (
    <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
      {/* Map Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
        <div className="absolute inset-0 opacity-10">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid Pattern */}
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Roads */}
            <path
              d="M 50 100 Q 150 80 250 120 T 350 150"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted-foreground"
            />
            <path
              d="M 100 50 L 100 250"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground"
            />
            <path
              d="M 300 50 L 300 250"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground"
            />
          </svg>
        </div>
      </div>

      {/* Markers */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="space-y-4 text-center">
          
          {/* Pickup Marker */}
          <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm font-medium text-foreground truncate max-w-48">
                {pickup.address}
              </p>
            </div>
            <MapPin className="h-4 w-4 text-green-600" />
          </div>

          {/* Route Line */}
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 via-blue-400 to-red-500 rounded-full"></div>
          </div>

          {/* Driver Location (if available) */}
          {driverLocation && ['accepted', 'driver-arriving', 'in-progress'].includes(rideStatus) && (
            <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <Car className="h-4 w-4 text-blue-600 animate-pulse" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Driver</p>
                <p className="text-sm font-medium text-foreground">
                  {rideStatus === 'driver-arriving' ? 'Arriving...' : 
                   rideStatus === 'in-progress' ? 'En route' : 'Assigned'}
                </p>
              </div>
            </div>
          )}

          {/* Destination Marker */}
          <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-medium text-foreground truncate max-w-48">
                {destination.address}
              </p>
            </div>
            <Navigation className="h-4 w-4 text-red-600" />
          </div>
        </div>
      </div>

      {/* Status Overlay */}
      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
        {rideStatus === 'pending' && 'Searching for driver...'}
        {rideStatus === 'accepted' && 'Driver assigned'}
        {rideStatus === 'driver-arriving' && 'Driver arriving'}
        {rideStatus === 'in-progress' && 'Trip in progress'}
        {rideStatus === 'completed' && 'Trip completed'}
        {rideStatus === 'cancelled' && 'Trip cancelled'}
      </div>

      {/* Map Controls Placeholder */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button className="w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          +
        </button>
        <button className="w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          −
        </button>
      </div>
    </div>
  );
}

export default RideTrackingMap;