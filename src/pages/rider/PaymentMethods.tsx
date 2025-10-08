import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CreditCard,
  Plus,
  Trash2,
  Check,
  Star,
  AlertCircle,
  Wallet,
  Shield,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { 
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useRemovePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation 
} from '@/redux/features/rider/riderApi';


// Form validation schema
const paymentMethodSchema = z.object({
  type: z.enum(['credit-card', 'debit-card', 'paypal', 'apple-pay', 'google-pay'], {
    message: 'Please select a payment method type'
  }),
  cardNumber: z.string().min(16, 'Card number must be at least 16 digits'),
  expiryMonth: z.string().min(1, 'Expiry month is required'),
  expiryYear: z.string().min(4, 'Expiry year is required'),
  cvv: z.string().min(3, 'CVV must be at least 3 digits'),
  cardHolderName: z.string().min(2, 'Card holder name is required'),
  nickname: z.string().optional(),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodsProps {
  className?: string;
}

const paymentTypeLabels = {
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  'paypal': 'PayPal',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
  'cash': 'Cash',
  'card': 'Card',
  'wallet': 'Wallet',
};

const paymentTypeIcons = {
  'credit-card': CreditCard,
  'debit-card': CreditCard,
  'paypal': Wallet,
  'cash': Banknote,
  'card': CreditCard,
  'wallet': Wallet,
  'apple-pay': Wallet,
  'google-pay': Wallet,
};

export function PaymentMethods({ className = '' }: PaymentMethodsProps) {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<string>('credit-card');
  
  const { data: paymentMethods = [], isLoading, refetch } = useGetPaymentMethodsQuery();
  const [addPaymentMethod, { isLoading: adding }] = useAddPaymentMethodMutation();
  const [removePaymentMethod, { isLoading: removing }] = useRemovePaymentMethodMutation();
  const [setDefaultPaymentMethod, { isLoading: settingDefault }] = useSetDefaultPaymentMethodMutation();

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: 'credit-card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardHolderName: '',
      nickname: '',
    },
  });

  // Map form type to API type
  const mapFormTypeToApiType = (formType: string): 'cash' | 'card' | 'wallet' => {
    switch (formType) {
      case 'credit-card':
      case 'debit-card':
        return 'card';
      case 'paypal':
      case 'apple-pay':
      case 'google-pay':
        return 'wallet';
      default:
        return 'card';
    }
  };

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      await addPaymentMethod({
        type: mapFormTypeToApiType(data.type),
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        nickname: data.nickname || `${paymentTypeLabels[data.type]} ending in ${data.cardNumber.slice(-4)}`,
        isDefault: paymentMethods.length === 0, // First card becomes default
        details: {
          cardType: getCardBrand(data.cardNumber),
          cardLast4: data.cardNumber.slice(-4),
        }
      }).unwrap();

      toast.success('Payment method added successfully');
      form.reset();
      setIsAddingPayment(false);
      refetch();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } })?.data?.message || 'Failed to add payment method'
        : 'Failed to add payment method';
      toast.error(errorMessage);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      await removePaymentMethod(paymentMethodId).unwrap();
      toast.success('Payment method removed successfully');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } })?.data?.message || 'Failed to remove payment method'
        : 'Failed to remove payment method';
      toast.error(errorMessage);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId).unwrap();
      toast.success('Default payment method updated');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } })?.data?.message || 'Failed to set default payment method'
        : 'Failed to set default payment method';
      toast.error(errorMessage);
    }
  };

  const formatCardNumber = (cardNumber: string) => {
    return `**** **** **** ${cardNumber?.slice(-4) || '****'}`;
  };

  const getCardBrand = (cardNumber: string) => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    return 'Card';
  };

  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your payment methods for seamless ride booking
          </p>
        </div>

        <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Add Payment Method
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Payment Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select
                  value={selectedCardType}
                  onValueChange={(value) => {
                    setSelectedCardType(value);
                    form.setValue('type', value as 'credit-card' | 'debit-card' | 'paypal' | 'apple-pay' | 'google-pay');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  {...form.register('cardNumber')}
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                />
                {form.formState.errors.cardNumber && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cardNumber.message}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Select onValueChange={(value) => form.setValue('expiryMonth', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0');
                        return (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Select onValueChange={(value) => form.setValue('expiryYear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = (new Date().getFullYear() + i).toString();
                        return (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CVV */}
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  {...form.register('cvv')}
                  placeholder="123"
                  maxLength={4}
                  type="password"
                />
                {form.formState.errors.cvv && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cvv.message}
                  </p>
                )}
              </div>

              {/* Card Holder Name */}
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Card Holder Name</Label>
                <Input
                  id="cardHolderName"
                  {...form.register('cardHolderName')}
                  placeholder="John Doe"
                />
                {form.formState.errors.cardHolderName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cardHolderName.message}
                  </p>
                )}
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Optional)</Label>
                <Input
                  id="nickname"
                  {...form.register('nickname')}
                  placeholder="My Primary Card"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingPayment(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  className="flex-1 btn-primary"
                >
                  {adding ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Adding...
                    </div>
                  ) : (
                    'Add Payment Method'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Your payment information is secure
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              We use industry-standard encryption to protect your payment data. 
              Card details are tokenized and never stored on our servers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No payment methods added</h3>
                <p className="text-muted-foreground">
                  Add a payment method to start booking rides
                </p>
              </div>
              <Button 
                onClick={() => setIsAddingPayment(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {paymentMethods.map((method) => {
              const IconComponent = paymentTypeIcons[method.type] || CreditCard;
              
              return (
                <motion.div
                  key={method.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`glass ${method.isDefault ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {method.nickname || `${paymentTypeLabels[method.type]}`}
                              </h3>
                              {method.isDefault && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{getCardBrand(method.cardNumber || '')}</span>
                              <span>•</span>
                              <span>{formatCardNumber(method.cardNumber || '')}</span>
                              <span>•</span>
                              <span>Expires {method.expiryMonth}/{method.expiryYear}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                              disabled={settingDefault}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Set Default
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={removing}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-destructive" />
                                  Remove Payment Method
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this payment method? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemovePaymentMethod(method.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

export default PaymentMethods;