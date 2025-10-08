import { Link } from 'react-router-dom';
import { ArrowRight, Car, Shield, Clock, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const features = [
    {
      icon: <Car className="h-8 w-8 text-primary" />,
      title: 'Quick Booking',
      description: 'Book your ride in just a few taps with our intuitive interface.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Safe & Secure',
      description: 'All drivers are verified and rides are tracked for your safety.',
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: '24/7 Availability',
      description: 'Get rides anytime, anywhere with our round-the-clock service.',
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: 'Multiple Payment Options',
      description: 'Pay with cash, card, or digital wallet - your choice.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Regular Rider',
      content: 'RideBook has made my daily commute so much easier. The drivers are professional and the app is super user-friendly.',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      role: 'Driver Partner',
      content: 'As a driver, I love how RideBook helps me earn a steady income with flexible hours. The support team is also very responsive.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Business User',
      content: 'We use RideBook for all our corporate transportation needs. Reliable, professional, and cost-effective.',
      rating: 5,
    },
  ];

  const steps = [
    {
      step: 1,
      title: 'Book Your Ride',
      description: 'Enter your pickup and destination locations.',
    },
    {
      step: 2,
      title: 'Get Matched',
      description: 'We find the nearest available driver for you.',
    },
    {
      step: 3,
      title: 'Track & Ride',
      description: 'Track your driver in real-time and enjoy your ride.',
    },
    {
      step: 4,
      title: 'Rate & Pay',
      description: 'Rate your experience and pay securely.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Your Ride, 
                <span className="block text-yellow-400">Your Way</span>
              </h1>
              <p className="text-xl lg:text-2xl opacity-90">
                Connect with trusted drivers in your area. Safe, convenient, and affordable rides at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100">
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-primary">
                  <Link to="/features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3" 
                alt="Ride booking illustration"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RideBook?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best ride experience with cutting-edge technology and exceptional service.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Getting your ride is as easy as 1-2-3-4
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="mx-auto w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied riders and drivers. Download our app or sign up on the web to start your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100">
              <Link to="/register">
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/login">
                Already a Member? Login
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;