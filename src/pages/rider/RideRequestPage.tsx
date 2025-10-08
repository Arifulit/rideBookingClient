
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'sonner';
import RideRequestForm from './components/RideRequestForm';
import { Card } from '@/components/ui/card';

interface RideRequestPageProps {
  className?: string;
}

export function RideRequestPage({ className = '' }: RideRequestPageProps) {
  const handleRideSuccess = (rideId: string) => {
    console.log('Ride created with ID:', rideId);
    // Navigate to live tracking or ride details page
    // You can implement navigation logic here
  };

  return (
    <>
      <Helmet>
        <title>Request a Ride - Ride Booking Platform</title>
        <meta name="description" content="Request a ride with pickup and destination, choose ride type, and get instant fare estimation." />
      </Helmet>

      <div className={`min-h-screen bg-background ${className}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold gradient-text">
                Book Your Ride
              </h1>
              <p className="text-lg text-muted-foreground">
                Enter your pickup and destination to get started
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ride Request Form */}
              <div className="lg:col-span-2">
                <RideRequestForm onSuccess={handleRideSuccess} />
              </div>

              {/* Sidebar - Recent Rides, Tips, etc. */}
              <div className="space-y-4">
                <Card className="p-4 glass">
                  <h3 className="font-semibold text-foreground mb-3">Quick Tips</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Make sure your pickup location is accurate</p>
                    <p>• Check surge pricing during peak hours</p>
                    <p>• Add special instructions for easier pickup</p>
                    <p>• Keep your phone charged for ride tracking</p>
                  </div>
                </Card>

                <Card className="p-4 glass">
                  <h3 className="font-semibold text-foreground mb-3">Safety Features</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Real-time ride tracking</p>
                    <p>• Driver verification system</p>
                    <p>• 24/7 customer support</p>
                    <p>• Emergency assistance button</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </div>
    </>
  );
}

export default RideRequestPage;