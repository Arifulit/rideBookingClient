import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ban, Mail, Phone, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { useAppDispatch } from '@/redux/hook';
import { logout } from '@/redux/index';
import type { User, AccountStatus } from '@/types/auth';

interface AccountStatusPageProps {
  status: AccountStatus;
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: 'destructive' | 'warning' | 'default';
}

const AccountStatusPage: React.FC<AccountStatusPageProps> = ({
  status,
  title,
  description,
  icon,
  variant,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = (location.state as { user?: User })?.user;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login', { replace: true });
  };

  const handleContactSupport = () => {
    // Open email client with pre-filled support email
    const subject = encodeURIComponent(`Account ${status} - User ID: ${user?.id}`);
    const body = encodeURIComponent(`
Dear Support Team,

I am contacting you regarding my account status: ${status}

User Details:
- Name: ${user?.firstName} ${user?.lastName}
- Email: ${user?.email}
- User ID: ${user?.id}
- Role: ${user?.role}

Please review my account and provide assistance.

Thank you,
${user?.firstName} ${user?.lastName}
    `);
    window.location.href = `mailto:support@ridebook.com?subject=${subject}&body=${body}`;
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'blocked':
        return {
          message: 'Your account has been permanently blocked due to violations of our terms of service.',
          canAppeal: true,
          showSupportContact: true,
          actions: ['Contact Support', 'Review Terms'],
        };
      case 'suspended':
        return {
          message: 'Your account has been temporarily suspended. This suspension will be reviewed.',
          canAppeal: true,
          showSupportContact: true,
          actions: ['Contact Support', 'Appeal Suspension'],
        };
      case 'pending_verification':
        return {
          message: 'Your account is pending verification. Please complete the verification process.',
          canAppeal: false,
          showSupportContact: true,
          actions: ['Verify Account', 'Resend Verification'],
        };
      case 'offline_restricted':
        return {
          message: 'Your driver account is currently offline-restricted. You cannot accept new rides.',
          canAppeal: true,
          showSupportContact: true,
          actions: ['Contact Support', 'Review Requirements'],
        };
      default:
        return {
          message: 'There is an issue with your account status.',
          canAppeal: true,
          showSupportContact: true,
          actions: ['Contact Support'],
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 p-3 rounded-full w-16 h-16 flex items-center justify-center ${
              variant === 'destructive' 
                ? 'bg-destructive/10 text-destructive'
                : variant === 'warning'
                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                : 'bg-muted text-muted-foreground'
            }`}>
              {icon}
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
            <Badge 
              variant={variant === 'destructive' ? 'destructive' : variant === 'warning' ? 'secondary' : 'default'}
              className="mx-auto mt-2"
            >
              Status: {status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Alert */}
            <Alert variant={variant === 'warning' ? 'destructive' : variant}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-base">
                {statusInfo.message}
              </AlertDescription>
            </Alert>

            {/* User Information */}
            {user && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> {user.id}
                  </div>
                </div>
              </div>
            )}

            {/* Suspension Details (for suspended accounts) */}
            {status === 'suspended' && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                    Suspension Details
                  </h3>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Your account has been temporarily suspended and is under review. 
                  The suspension will be automatically reviewed within 24-48 hours.
                </p>
              </div>
            )}

            {/* Verification Required (for pending verification) */}
            {status === 'pending_verification' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Verification Required
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Complete the following steps to activate your account:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Verify your email address</li>
                  <li>• Verify your phone number</li>
                  {user?.role === 'driver' && (
                    <>
                      <li>• Upload required documents</li>
                      <li>• Complete driver verification</li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {statusInfo.showSupportContact && (
                <Button 
                  onClick={handleContactSupport}
                  className="flex-1"
                  variant="default"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              )}

              {status === 'pending_verification' && (
                <Button 
                  onClick={() => navigate('/auth/verify-account')}
                  className="flex-1"
                  variant="default"
                >
                  Complete Verification
                </Button>
              )}

              {statusInfo.canAppeal && status !== 'pending_verification' && (
                <Button 
                  onClick={() => navigate('/auth/appeal', { state: { user, status } })}
                  variant="outline"
                  className="flex-1"
                >
                  Submit Appeal
                </Button>
              )}
            </div>

            {/* Support Information */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Need Help?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-muted-foreground">support@ridebook.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Phone Support</div>
                    <div className="text-muted-foreground">+1 (555) 123-4567</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Support hours: Monday-Friday 9AM-6PM EST. We typically respond within 24 hours.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Specific status page components
export const AccountBlockedPage: React.FC = () => (
  <AccountStatusPage
    status="blocked"
    title="Account Blocked"
    description="Your account has been blocked due to policy violations"
    icon={<Ban className="h-8 w-8" />}
    variant="destructive"
  />
);

export const AccountSuspendedPage: React.FC = () => (
  <AccountStatusPage
    status="suspended"
    title="Account Suspended"
    description="Your account is temporarily suspended and under review"
    icon={<Clock className="h-8 w-8" />}
    variant="warning"
  />
);

export const PendingVerificationPage: React.FC = () => (
  <AccountStatusPage
    status="pending_verification"
    title="Verification Required"
    description="Please complete your account verification to continue"
    icon={<AlertTriangle className="h-8 w-8" />}
    variant="warning"
  />
);

export const OfflineRestrictedPage: React.FC = () => (
  <AccountStatusPage
    status="offline_restricted"
    title="Driver Offline Restricted"
    description="Your driver account is currently restricted from going online"
    icon={<Ban className="h-8 w-8" />}
    variant="warning"
  />
);

export default AccountStatusPage;