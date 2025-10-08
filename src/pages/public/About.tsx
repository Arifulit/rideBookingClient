import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          About RideBook
        </h1>
        <p className="text-lg text-gray-600">
          Your trusted partner for safe and reliable transportation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            At RideBook, we're committed to revolutionizing urban transportation by connecting 
            riders with reliable drivers through our innovative platform. We believe in making 
            transportation accessible, safe, and affordable for everyone.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-4">
            Founded in 2024, RideBook emerged from a simple idea: transportation should be 
            convenient, safe, and reliable for everyone. Our team of passionate developers 
            and transportation experts came together to create a platform that puts both 
            riders and drivers first.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Today, we serve thousands of users daily, connecting communities and making 
            urban mobility more efficient and sustainable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;