'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { CloseIcon } from '@/components/ui/CloseIcon';
import { useModalStore } from '@/stores/modal-store';

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  overline?: string;
  title?: string;
  description?: string;
  showClose?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

function ModalHeader({
  overline,
  title,
  description,
  showClose = true,
  onClose,
  children,
  className,
  ...props
}: ModalHeaderProps) {
  const { close } = useModalStore();

  const handleClose = onClose || close;

  // If children provided, use custom content mode
  if (children) {
    return (
      <div className={cn('flex items-center justify-between p-400', className)} {...props}>
        <div className="flex items-center gap-300">{children}</div>
        {showClose && <CloseIcon onClick={handleClose} className="shrink-0" />}
      </div>
    );
  }

  return (
    <div className={cn('flex items-start justify-between p-400', className)} {...props}>
      <div className="flex flex-col">
        {overline && <p className="typo-caption1 text-text-alternative mb-200">{overline}</p>}
        {title && <h2 className="typo-sub1 text-text-strong mb-200">{title}</h2>}
        {description && <p className="typo-body2 text-text-alternative">{description}</p>}
      </div>
      {showClose && <CloseIcon onClick={handleClose} className="shrink-0" />}
    </div>
  );
}

export { ModalHeader };
export type { ModalHeaderProps };
