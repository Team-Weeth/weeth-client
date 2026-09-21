'use client';

import { useToasts, useToastActions } from '@/stores/useToastStore';

import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import type { ToastPosition } from '@/components/ui/Toast';

interface ToasterProps {
  position?: ToastPosition;
}

function Toaster({ position = 'top' }: ToasterProps) {
  const toasts = useToasts();
  const { dismissToast } = useToastActions();

  return (
    <ToastProvider position={position}>
      {toasts.map(({ id, title, variant, duration }) => (
        <Toast
          key={id}
          variant={variant}
          position={position}
          duration={duration ?? 2000}
          onOpenChange={(open) => {
            if (!open) dismissToast(id);
          }}
        >
          {title}
        </Toast>
      ))}
      <ToastViewport position={position} />
    </ToastProvider>
  );
}

export { Toaster };
