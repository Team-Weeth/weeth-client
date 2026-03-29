'use client';

import { useToasts, useToastActions } from '@/stores/useToastStore';

import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';

function Toaster() {
  const toasts = useToasts();
  const { dismissToast } = useToastActions();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, variant, duration }) => (
        <Toast
          key={id}
          variant={variant}
          duration={duration ?? 2000}
          onOpenChange={(open) => {
            if (!open) dismissToast(id);
          }}
        >
          {title}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export { Toaster };
