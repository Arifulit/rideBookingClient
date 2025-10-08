
import { Link } from 'react-router-dom';
import { Search, Chrome as Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            
            <h1 className="text-6xl font-bold text-primary mb-4">
              404
            </h1>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Page Not Found
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Sorry, we couldn't find the page you're looking for. The page may have been moved, 
              deleted, or you entered the wrong URL.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <h3 className="font-medium text-gray-800 mb-3">What you can do:</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• Check the URL for any typing errors</li>
                <li>• Go back to the previous page and try again</li>
                <li>• Visit our homepage to find what you're looking for</li>
                <li>• Use the search function if available</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Still can't find what you're looking for?{' '}
                <Link 
                  to="/contact" 
                  className="text-primary hover:underline font-medium"
                >
                  Contact our support team
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;