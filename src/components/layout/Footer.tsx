import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-white dark:text-gray-100">RideBook</span>
            </div>
            <p className="text-sm">
              Your trusted ride booking platform connecting riders with professional drivers
              for safe, convenient, and affordable transportation.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white dark:text-gray-100">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/features" className="block text-sm hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/contact" className="block text-sm hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="block text-sm hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link to="/privacy" className="block text-sm hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-sm hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white dark:text-gray-100">Services</h3>
            <div className="space-y-2">
              <div className="text-sm">Ride Booking</div>
              <div className="text-sm">Driver Partnership</div>
              <div className="text-sm">Corporate Solutions</div>
              <div className="text-sm">24/7 Support</div>
              <div className="text-sm">Emergency Assistance</div>
              <div className="text-sm">Payment Solutions</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white dark:text-gray-100">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>123 Business St, City, State 12345</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>support@ridebook.com</span>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold">Customer Support</p>
              <p>Available 24/7</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © 2025 RideBook. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="text-sm text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;