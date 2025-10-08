import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface UniversalRouteProtectorProps {
  children: React.ReactNode;
}

const UniversalRouteProtector: React.FC<UniversalRouteProtectorProps> = ({ children }) => {
  const { loading } = useSelector((state: RootState) => state.auth);
  
  // Add global loading state for better UX
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Application</h3>
            <p className="text-sm text-muted-foreground">Please wait while we prepare everything for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UniversalRouteProtector;