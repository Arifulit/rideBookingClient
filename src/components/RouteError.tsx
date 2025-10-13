import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message: string | null = null;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    // Try to read json message if available
  // @ts-expect-error - runtime may have data property
  message = error.data?.message || null;
  } else if (error instanceof Error) {
    title = error.name;
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}

        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button variant="outline" onClick={() => navigate('/') }>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
