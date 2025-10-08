
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Car, 
  Navigation, 
  MapPin,
  UserCheck 
} from 'lucide-react';
import type { RideStatus } from '@/types/rider';

interface RideStatusTimelineProps {
  currentStatus: RideStatus;
  timestamps: {
    requested?: string;
    accepted?: string;
    driverArriving?: string;
    pickupTime?: string;
    dropoffTime?: string;
    cancelledAt?: string;
  };
  className?: string;
}

const timelineSteps = [
  {
    key: 'requested',
    label: 'Ride Requested',
    icon: Clock,
    status: 'pending' as RideStatus,
    description: 'Your ride request has been submitted'
  },
  {
    key: 'accepted',
    label: 'Driver Assigned',
    icon: UserCheck,
    status: 'accepted' as RideStatus,
    description: 'A driver has accepted your ride'
  },
  {
    key: 'driverArriving',
    label: 'Driver Arriving',
    icon: Navigation,
    status: 'driver-arriving' as RideStatus,
    description: 'Driver is on the way to pickup location'
  },
  {
    key: 'pickupTime',
    label: 'Trip Started',
    icon: Car,
    status: 'in-progress' as RideStatus,
    description: 'You have been picked up, trip in progress'
  },
  {
    key: 'dropoffTime',
    label: 'Trip Completed',
    icon: MapPin,
    status: 'completed' as RideStatus,
    description: 'You have reached your destination'
  }
] as const;

export function RideStatusTimeline({
  currentStatus,
  timestamps,
  className = ''
}: RideStatusTimelineProps) {
  
  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getStepStatus = (stepStatus: RideStatus, stepKey: string) => {
    if (currentStatus === 'cancelled') {
      // If ride is cancelled, show only completed steps before cancellation
      return timestamps[stepKey as keyof typeof timestamps] ? 'completed' : 'pending';
    }
    
    const statusOrder: RideStatus[] = ['pending', 'accepted', 'driver-arriving', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'pending';
  };

  // Handle cancelled status
  if (currentStatus === 'cancelled') {
    const completedSteps = timelineSteps.filter(step => 
      timestamps[step.key as keyof typeof timestamps]
    );
    
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Completed steps */}
        {completedSteps.map((step, index) => {
          const StepIcon = step.icon;
          const timestamp = timestamps[step.key as keyof typeof timestamps];
          
          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-green-500 flex items-center justify-center">
                  <StepIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                {index < completedSteps.length - 1 && (
                  <div className="absolute top-8 left-4 w-0.5 h-8 bg-green-200 dark:bg-green-800"></div>
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{step.label}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
        
        {/* Cancelled step */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 border-2 border-red-500 flex items-center justify-center">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Ride Cancelled</h4>
              <span className="text-xs text-muted-foreground">
                {formatTime(timestamps.cancelledAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              The ride has been cancelled
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normal timeline for active/completed rides
  return (
    <div className={`space-y-4 ${className}`}>
      {timelineSteps.map((step, index) => {
        const StepIcon = step.icon;
        const stepStatus = getStepStatus(step.status, step.key);
        const timestamp = timestamps[step.key as keyof typeof timestamps];
        
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="relative">
              <div 
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  stepStatus === 'completed' 
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                    : stepStatus === 'current'
                    ? 'bg-primary/10 border-primary animate-pulse'
                    : 'bg-muted border-muted-foreground/30'
                }`}
              >
                {stepStatus === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <StepIcon 
                    className={`h-4 w-4 ${
                      stepStatus === 'current' 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                )}
              </div>
              
              {index < timelineSteps.length - 1 && (
                <div 
                  className={`absolute top-8 left-4 w-0.5 h-8 transition-colors duration-200 ${
                    stepStatus === 'completed' 
                      ? 'bg-green-200 dark:bg-green-800'
                      : 'bg-muted-foreground/20'
                  }`}
                ></div>
              )}
            </div>
            
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between">
                <h4 
                  className={`font-medium ${
                    stepStatus === 'completed' || stepStatus === 'current'
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </h4>
                {timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(timestamp)}
                  </span>
                )}
              </div>
              
              <p 
                className={`text-sm mt-1 ${
                  stepStatus === 'completed' || stepStatus === 'current'
                    ? 'text-muted-foreground' 
                    : 'text-muted-foreground/60'
                }`}
              >
                {step.description}
              </p>
              
              {stepStatus === 'current' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    Current step
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RideStatusTimeline;