
import { Link } from 'react-router-dom';
import { Shield, Chrome as Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              You don't have permission to access this page. This area is restricted to authorized users only.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <h3 className="font-medium text-red-800 mb-2">Why am I seeing this?</h3>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• You may not have the required role permissions</li>
                <li>• Your account may need additional verification</li>
                <li>• You might have accessed a restricted URL</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team at{' '}
                <a 
                  href="mailto:support@ridebook.com" 
                  className="text-primary hover:underline"
                >
                  support@ridebook.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Unauthorized;