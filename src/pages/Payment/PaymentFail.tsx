import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const PaymentFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Payment was declined';
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Store payment failure for retry purposes
    if (orderId) {
      localStorage.setItem('failedPayment', JSON.stringify({
        orderId,
        amount,
        reason,
        timestamp: new Date().toISOString()
      }));
    }
  }, [orderId, amount, reason]);

  const handleRetryPayment = () => {
    // Navigate back to payment with the same order details
    const paymentData = localStorage.getItem('failedPayment');
    if (paymentData) {
      navigate('/rider/book-ride', { 
        state: { retryPayment: JSON.parse(paymentData) }
      });
    } else {
      navigate('/rider/book-ride');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Payment Failed
          </CardTitle>
          <CardDescription>
            We couldn't process your payment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-800">Reason:</p>
            <p className="text-sm text-red-700">{reason}</p>
          </div>
          
          {amount && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-lg font-bold">${amount}</p>
            </div>
          )}
          
          {orderId && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm font-medium">{orderId}</p>
            </div>
          )}
          
          <div className="border-t pt-4 mt-6">
            <h3 className="font-medium mb-3">What you can do:</h3>
            <ul className="text-sm text-gray-600 text-left space-y-2">
              <li>• Check your payment method details</li>
              <li>• Ensure sufficient funds in your account</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              onClick={handleRetryPayment} 
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/rider/dashboard')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="link" 
              onClick={() => navigate('/contact')}
              className="text-sm"
            >
              Need help? Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFail;