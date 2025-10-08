import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Clock, MapPin, CreditCard, Star } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Safe & Secure",
      description: "All drivers are verified with background checks and real-time tracking for your safety.",
      badges: ["Verified Drivers", "24/7 Support", "Insurance Coverage"]
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Quick Booking",
      description: "Book your ride in seconds with our easy-to-use app. No waiting, no hassle.",
      badges: ["Instant Booking", "Real-time Updates", "Quick Matching"]
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "GPS Tracking",
      description: "Track your ride in real-time and share your location with friends and family.",
      badges: ["Live Tracking", "Route Optimization", "ETA Updates"]
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Flexible Payment",
      description: "Multiple payment options including cash, card, and digital wallets.",
      badges: ["Multiple Options", "Secure Payment", "Auto-billing"]
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Premium Experience",
      description: "Enjoy a premium ride experience with professional drivers and clean vehicles.",
      badges: ["Professional Service", "Clean Vehicles", "Comfort Guaranteed"]
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Reliable Service",
      description: "Count on us for reliable transportation with high availability and punctuality.",
      badges: ["High Availability", "On-time Service", "Consistent Quality"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Why Choose <span className="text-primary">RideBook</span>?
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of transportation with our innovative features designed for your comfort, safety, and convenience.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feature.badges.map((badge, badgeIndex) => (
                      <Badge key={badgeIndex} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">More Features Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Scheduled Rides</h3>
              <p className="text-muted-foreground">Book your rides in advance for important appointments.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Ride Sharing</h3>
              <p className="text-muted-foreground">Share rides with others going in the same direction.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Corporate Accounts</h3>
              <p className="text-muted-foreground">Special packages for businesses and organizations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;