'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { Divider } from '@/components/ui/Divider';

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  description?: string;
  pagination?: React.ReactNode;
  showDivider?: boolean;
}

function ModalFooter({
  children,
  description,
  pagination,
  showDivider = true,
  className,
  ...props
}: ModalFooterProps) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {showDivider && <Divider />}
      <div className="flex flex-col gap-[10px] p-400">
        {children}
        {pagination
          ? pagination
          : description && (
              <p className="typo-caption2 text-text-alternative mt-200 text-center">
                {description}
              </p>
            )}
      </div>
    </div>
  );
}

export { ModalFooter };
export type { ModalFooterProps };
