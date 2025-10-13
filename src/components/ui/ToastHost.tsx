import React from 'react';
import { useToast as useLegacyToast } from '@/hooks/use-toast';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from './toast';

const ToastHost: React.FC = () => {
  const state = useLegacyToast();

  return (
    <ToastProvider>
      {state.toasts.map((t) => (
        <Toast
          key={t.id}
          open={Boolean(t.open)}
          onOpenChange={t.onOpenChange as unknown as (open: boolean) => void}
          variant={(t.variant as 'default' | 'destructive') ?? 'default'}
        >
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          {t.action && (
            // action is expected to be a ToastAction element
            <div className="mt-2">{t.action}</div>
          )}
          <ToastClose />
        </Toast>
      ))}

      <ToastViewport />
    </ToastProvider>
  );
};

export default ToastHost;
