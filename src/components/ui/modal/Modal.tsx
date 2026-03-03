'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useModalStore } from '@/stores/modal-store';

interface ModalProps {
  /** 제어 모드: open prop 전달 시 (기본값: store 사용) */
  open?: boolean;
  /** 제어 모드: onOpenChange 전달 시 */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Modal({ open: controlledOpen, onOpenChange, children }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const { isOpen: storeOpen, close } = useModalStore();

  // 제어 모드: open prop이 제공되면 사용, 아니면 store 사용
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : storeOpen;

  const handleClose = React.useCallback(() => {
    if (isControlled && onOpenChange) {
      onOpenChange(false);
    } else {
      close();
    }
  }, [isControlled, onOpenChange, close]);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-neutral-800/60" onClick={handleClose} aria-hidden="true" />

      {/* Modal Content */}
      <div className="bg-container-neutral relative z-50 flex max-h-[90vh] w-full max-w-[600px] flex-col rounded-lg">
        {children}
      </div>
    </div>,
    document.body,
  );
}

export { Modal };
export type { ModalProps };
