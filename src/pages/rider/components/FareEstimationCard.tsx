
import { DollarSign, Clock, MapPin, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { FareEstimation } from '@/types/rider';

interface FareEstimationCardProps {
  estimation: FareEstimation;
  isLoading?: boolean;
  className?: string;
}

export function FareEstimationCard({ 
  estimation, 
  isLoading = false, 
  className = "" 
}: FareEstimationCardProps) {
  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    if (km >= 1) {
      return `${km.toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="glass border-primary/20">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header with Total Fare */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Fare Estimation</h3>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(estimation.total)}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {estimation.rideType}
                </Badge>
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Duration
                </div>
                <div className="font-medium text-foreground">
                  {formatDuration(estimation.duration)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Distance
                </div>
                <div className="font-medium text-foreground">
                  {formatDistance(estimation.distance)}
                </div>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Info className="h-3 w-3" />
                Fare Breakdown
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="text-foreground">{formatCurrency(estimation.baseFare)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Distance Fee</span>
                  <span className="text-foreground">{formatCurrency(estimation.distanceFare)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time Fee</span>
                  <span className="text-foreground">{formatCurrency(estimation.timeFare)}</span>
                </div>
                
                {estimation.surgeFare > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Surge Pricing ({estimation.surgeMultiplier}x)
                    </span>
                    <span className="text-orange-600 font-medium">
                      +{formatCurrency(estimation.surgeFare)}
                    </span>
                  </div>
                )}
                
                {estimation.taxes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="text-foreground">{formatCurrency(estimation.taxes)}</span>
                  </div>
                )}
                
                {estimation.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600 font-medium">
                      -{formatCurrency(estimation.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">
                      {formatCurrency(estimation.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              {estimation.surgeFare > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-orange-800 dark:text-orange-200">
                      Surge pricing is active
                    </div>
                    <div className="text-orange-700 dark:text-orange-300">
                      Higher demand in this area. Prices are {estimation.surgeMultiplier}x higher than usual.
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="text-xs text-muted-foreground">
                * Fare estimation is approximate and may vary based on actual route and traffic conditions.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default FareEstimationCard;