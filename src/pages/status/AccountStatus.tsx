import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/redux/hook';
import { selectUser } from '@/redux/store';

const AccountStatus = () => {
  
  const user = useAppSelector(selectUser);
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'blocked':
        return {
          title: 'Account Blocked',
          message: 'Your account has been temporarily blocked due to policy violations.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'suspended':
        return {
          title: 'Account Suspended',
          message: 'Your account is currently under review and temporarily suspended.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      default:
        return {
          title: 'Account Issue',
          message: 'There is an issue with your account that needs attention.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusDetails = getStatusDetails((user as { status?: string })?.status || 'unknown');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className={`shadow-xl ${statusDetails.borderColor}`}>
          <CardHeader className={`${statusDetails.bgColor} text-center rounded-t-lg`}>
            <div className={`mx-auto mb-4 w-16 h-16 rounded-full ${statusDetails.bgColor} flex items-center justify-center`}>
              <AlertTriangle className={`h-8 w-8 ${statusDetails.color}`} />
            </div>
            <CardTitle className={`text-2xl font-bold ${statusDetails.color}`}>
              {statusDetails.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              {statusDetails.message}
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What this means:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {(user as { status?: string })?.status === 'blocked' ? (
                    <>
                      <li>• You cannot access your account dashboard</li>
                      <li>• All ride bookings are temporarily disabled</li>
                      <li>• Contact support to resolve this issue</li>
                    </>
                  ) : (
                    <>
                      <li>• Your account is under review</li>
                      <li>• Some features may be limited</li>
                      <li>• This is usually temporary</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full" asChild>
                <a href="mailto:support@ridebook.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="tel:+15551234567">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Support
                </a>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2">
                <strong>Support Hours:</strong> 24/7 Available
              </p>
              <p className="text-xs text-gray-400">
                Reference ID: {(user as { id?: string })?.id || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountStatus;