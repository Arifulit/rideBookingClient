// import React from 'react';
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

import CommonLayout from "./components/layout/CommonLayout";
import { useAuthInitialization } from "./hooks/useAuthInitialization";
import AuthTokenLogger from "./components/auth/AuthTokenLogger";

function App() {
  const { isInitializing } = useAuthInitialization();

  // Show loading screen while initializing authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Loading RideBook</h2>
            <p className="text-sm text-muted-foreground">Initializing your session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CommonLayout>
      <AuthTokenLogger />
      <Outlet />
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </CommonLayout>
  );
}

export default App;
