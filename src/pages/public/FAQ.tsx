import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = [
    { id: 'all', name: 'All Questions', count: 24 },
    { id: 'booking', name: 'Booking Rides', count: 8 },
    { id: 'payment', name: 'Payments', count: 6 },
    { id: 'driver', name: 'Driver Questions', count: 5 },
    { id: 'safety', name: 'Safety & Security', count: 3 },
    { id: 'account', name: 'Account Management', count: 2 },
  ];

  const faqData = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a ride?',
      answer: 'To book a ride, simply open the RideBook app or website, enter your pickup location and destination, select your preferred payment method, and confirm your booking. You\'ll be matched with the nearest available driver.',
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I schedule a ride for later?',
      answer: 'Yes, you can schedule rides up to 7 days in advance. When booking, select the "Schedule for Later" option and choose your preferred date and time. We recommend booking scheduled rides at least 1 hour in advance.',
    },
    {
      id: 3,
      category: 'booking',
      question: 'How do I cancel a ride?',
      answer: 'You can cancel a ride through the app or website by going to "My Rides" and selecting the active booking. Please note that cancellation fees may apply depending on how close the driver is to your pickup location.',
    },
    {
      id: 4,
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept multiple payment methods including cash, credit/debit cards (Visa, MasterCard, American Express), and digital wallets. You can add and manage payment methods in your account settings.',
    },
    {
      id: 5,
      category: 'payment',
      question: 'How is the fare calculated?',
      answer: 'Fare calculation includes a base fare, time and distance charges, and may include surge pricing during high-demand periods. You\'ll see the estimated fare before confirming your booking, and the final fare after your trip completion.',
    },
    {
      id: 6,
      category: 'payment',
      question: 'Can I get a receipt for my ride?',
      answer: 'Yes, digital receipts are automatically sent to your email after each completed ride. You can also access all receipts in the "Ride History" section of your account.',
    },
    {
      id: 7,
      category: 'driver',
      question: 'How do I become a driver?',
      answer: 'To become a RideBook driver, you need a valid driver\'s license, vehicle registration, insurance, and must pass our background check. Visit our driver registration page, complete the application, upload required documents, and attend a brief orientation.',
    },
    {
      id: 8,
      category: 'driver',
      question: 'What are the vehicle requirements?',
      answer: 'Vehicles must be 2010 or newer, pass a safety inspection, have 4 doors, seat at least 4 passengers, and be in good condition. Commercial vehicles, taxis, and salvaged vehicles are not eligible.',
    },
    {
      id: 9,
      category: 'driver',
      question: 'How much can I earn as a driver?',
      answer: 'Driver earnings vary based on location, time worked, and demand. On average, drivers earn $15-25 per hour after expenses. You keep 80% of the fare, with weekly direct deposits to your bank account.',
    },
    {
      id: 10,
      category: 'safety',
      question: 'How do you ensure rider safety?',
      answer: 'We prioritize safety with driver background checks, real-time GPS tracking, ride sharing features, an in-app emergency button, 24/7 support, and driver photo verification. All rides are monitored for safety.',
    },
    {
      id: 11,
      category: 'safety',
      question: 'What should I do in case of an emergency?',
      answer: 'In case of emergency, use the SOS button in the app to immediately contact emergency services and notify our safety team. You can also call 911 directly. The app includes features to share your location with emergency contacts.',
    },
    {
      id: 12,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'To update your profile, log into your account and go to "Profile Settings." You can change your name, phone number, email, emergency contacts, and other personal information. Some changes may require verification.',
    },
    {
      id: 13,
      category: 'booking',
      question: 'Can I add multiple stops to my ride?',
      answer: 'Yes, you can add up to 3 additional stops to your ride during booking. Additional stop fees may apply, and total trip time is limited to 1 hour. You can modify stops during the ride through the app.',
    },
    {
      id: 14,
      category: 'payment',
      question: 'What if I\'m charged incorrectly?',
      answer: 'If you believe there\'s an error in your fare, contact our support team within 24 hours of the ride. We\'ll review the trip details and issue refunds for any valid discrepancies. You can submit fare disputes through the app.',
    },
    {
      id: 15,
      category: 'booking',
      question: 'How long will my driver take to arrive?',
      answer: 'Estimated arrival time is shown when you book and continuously updated in the app. Average wait times are 3-8 minutes in city areas. You can track your driver\'s location in real-time through the app.',
    },
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto">
            Find answers to common questions about booking rides, payments, safety, and more.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <div className="mb-12">
          <Card className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Filter */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <Badge variant={selectedCategory === category.id ? 'secondary' : 'outline'}>
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <Card key={faq.id} className="hover:shadow-lg transition-shadow">
                    <Collapsible>
                      <CollapsibleTrigger
                        onClick={() => toggleItem(faq.id)}
                        className="w-full"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-left font-medium text-lg pr-4">
                              {faq.question}
                            </h3>
                            {openItems.includes(faq.id) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 px-6 pb-6">
                          <div className="border-t pt-4">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                            <Badge
                              variant="outline"
                              className="mt-3 capitalize"
                            >
                              {faq.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">
                      No questions found matching your search.
                    </p>
                    <p className="text-gray-500 mt-2">
                      Try adjusting your search terms or browse different categories.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Support */}
            <Card className="mt-8 bg-primary text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Still need help?
                </h3>
                <p className="mb-6 opacity-90">
                  Can't find what you're looking for? Our support team is here to help 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Contact Support
                  </a>
                  <a
                    href="tel:+15551234567"
                    className="border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-colors"
                  >
                    Call: (555) 123-4567
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}