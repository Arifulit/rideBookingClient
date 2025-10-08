import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Driver } from '@/types/rider';

interface DriverRatingDialogProps {
  open: boolean;
  onClose: () => void;
  driver: Driver;
  onSubmit: (rating: number, comment?: string) => Promise<void>;
}

const ratingLabels = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
} as const;

export function DriverRatingDialog({
  open,
  onClose,
  driver,
  onSubmit
}: DriverRatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim() || undefined);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Rate Your Driver</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={driver.profileImage} 
                alt={driver.name} 
              />
              <AvatarFallback className="text-lg">
                {driver.name ? driver.name.split(' ').map(n => n[0]).join('') : 'D'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">{driver.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {driver.rating.toFixed(1)} • {driver.totalRides} trips
                </span>
              </div>
              
              {driver.vehicle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {driver.vehicle.make} {driver.vehicle.model}
                </p>
              )}
            </div>
          </div>

          {/* Rating Stars */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                How was your ride experience?
              </p>
              
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= displayRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Label */}
              <AnimatePresence mode="wait">
                {displayRating > 0 && (
                  <motion.div
                    key={displayRating}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm font-medium text-foreground"
                  >
                    {ratingLabels[displayRating as keyof typeof ratingLabels]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comment Section */}
          <AnimatePresence>
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-foreground">
                  Additional Comments (Optional)
                </label>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-right text-xs text-muted-foreground">
                  {comment.length}/500
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Rating
                </>
              )}
            </Button>
          </div>

          {/* Quick Rating Options */}
          {rating === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Quick rating:
              </p>
              <div className="flex gap-2">
                {[
                  { rating: 5, label: '😊 Great!', color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' },
                  { rating: 4, label: '👍 Good', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
                  { rating: 3, label: '👌 OK', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' },
                ].map((option) => (
                  <Button
                    key={option.rating}
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(option.rating)}
                    className={`flex-1 text-xs ${option.color}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DriverRatingDialog;