'use client';

import { useEffect, useState } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { AdminScopeBoundary } from '@/providers';
import { cn } from '@/lib/cn';

interface AdminNotification {
  id: string | number;
  category: string;
  content: string;
  timestamp: string;
}

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsed?: boolean;
  notifications?: AdminNotification[];
  className?: string;
}

function NotificationItem({ category, content, timestamp }: Omit<AdminNotification, 'id'>) {
  return (
    <div className="hover:bg-container-neutral-alternative flex cursor-pointer flex-col gap-200 rounded-md px-[10px] py-300 transition-colors">
      <div className="flex flex-col gap-100">
        <span className="typo-caption1 text-text-alternative">{category}</span>
        <span className="typo-sub3 text-text-normal">{content}</span>
      </div>
      <span className="typo-caption2 text-text-disabled">{timestamp}</span>
    </div>
  );
}

const ANIMATION_DURATION = 200;

function NotificationModal({
  open,
  onOpenChange,
  collapsed = false,
  notifications = [],
  className,
}: NotificationModalProps) {
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (open) return;
    const id = setTimeout(() => setMounted(false), ANIMATION_DURATION);
    return () => clearTimeout(id);
  }, [open]);

  if (!mounted) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal forceMount>
        <AdminScopeBoundary>
          <DialogPrimitive.Content
            forceMount
            onOpenAutoFocus={(e) => e.preventDefault()}
            className={cn(
              'bg-container-neutral fixed z-50 flex h-[360px] w-[320px] flex-col rounded-md pb-100 outline-none',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2',
              'duration-200',
              className,
            )}
            style={{ left: collapsed ? 88 : 230, bottom: 22, boxShadow: 'var(--shadow-lg)' }}
          >
            <DialogPrimitive.Title className="sr-only">알림</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">알림 목록</DialogPrimitive.Description>
            <div className="flex shrink-0 items-center px-300 pt-400 pb-200">
              <span className="typo-sub1 text-text-strong px-200">알림</span>
            </div>

            <div className="scrollbar-none flex flex-1 flex-col gap-200 overflow-y-auto px-200">
              {notifications.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <span className="typo-body2 text-text-disabled">아직 알람이 없습니다.</span>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    category={notification.category}
                    content={notification.content}
                    timestamp={notification.timestamp}
                  />
                ))
              )}
            </div>
          </DialogPrimitive.Content>
        </AdminScopeBoundary>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { NotificationModal, type NotificationModalProps, type AdminNotification };
