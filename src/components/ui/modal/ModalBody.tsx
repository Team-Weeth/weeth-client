'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ModalBody({ children, className, ...props }: ModalBodyProps) {
  return (
    <div
      className={cn('scrollbar-custom flex flex-col gap-300 overflow-y-auto p-400', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { ModalBody };
export type { ModalBodyProps };
