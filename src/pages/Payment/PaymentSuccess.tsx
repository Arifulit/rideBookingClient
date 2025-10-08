import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Store payment success in localStorage for dashboard
    if (transactionId) {
      localStorage.setItem('lastPayment', JSON.stringify({
        transactionId,
        amount,
        status: 'success',
        timestamp: new Date().toISOString()
      }));
    }
  }, [transactionId, amount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {transactionId && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-mono text-sm font-medium">{transactionId}</p>
            </div>
          )}
          
          {amount && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-lg font-bold text-green-600">${amount}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              onClick={() => navigate('/rider/dashboard')} 
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/rider/book-ride')}
              className="flex-1"
            >
              Book Another Ride
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;