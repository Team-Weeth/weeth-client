'use client';

import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Drawer } from 'vaul';

import { AdminScopeBoundary } from '@/providers';
import { useBottomSheetSnapPoints } from '@/hooks/useBottomSheetSnapPoints';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface BottomSheetProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  expandable?: boolean;
  initialSnapHeight?: number;
  topGap?: number;
  snapPoints?: (number | string)[];
  defaultActiveSnapPoint?: number | string | null;
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  title?: string;
  header?: ReactNode;
  footer?: ReactNode;
  showCancelButton?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
  overlayClassName?: string;
  handleClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

function BottomSheet({
  children,
  title = 'Bottom sheet',
  header,
  footer,
  showCancelButton = true,
  cancelLabel = '취소',
  onCancel,
  className,
  overlayClassName,
  handleClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  open,
  defaultOpen,
  onOpenChange,
  expandable = false,
  initialSnapHeight = 520,
  topGap = 40,
  snapPoints,
  defaultActiveSnapPoint,
  activeSnapPoint,
  setActiveSnapPoint,
}: BottomSheetProps) {
  const { resolvedSnapPoints, hasSnapPoints } = useBottomSheetSnapPoints({
    expandable,
    initialSnapHeight,
    topGap,
    snapPoints,
  });
  const [internalActiveSnapPoint, setInternalActiveSnapPoint] = useState<number | string | null>(
    defaultActiveSnapPoint ?? null,
  );
  const controlledActiveSnapPoint = activeSnapPoint !== undefined;
  const drawerActiveSnapPoint = controlledActiveSnapPoint
    ? activeSnapPoint
    : internalActiveSnapPoint;
  const setDrawerActiveSnapPoint = controlledActiveSnapPoint
    ? setActiveSnapPoint
    : setInternalActiveSnapPoint;
  const defaultDrawerActiveSnapPoint = defaultActiveSnapPoint ?? resolvedSnapPoints?.[0] ?? null;
  const previousOpenRef = useRef(open ?? defaultOpen ?? false);

  useEffect(() => {
    if (controlledActiveSnapPoint || defaultDrawerActiveSnapPoint === null) return;

    const wasOpen = previousOpenRef.current;
    const isOpen = open ?? defaultOpen ?? false;

    if ((!wasOpen && isOpen) || (isOpen && internalActiveSnapPoint === null)) {
      setInternalActiveSnapPoint(defaultDrawerActiveSnapPoint);
    }

    previousOpenRef.current = isOpen;
  }, [
    controlledActiveSnapPoint,
    defaultDrawerActiveSnapPoint,
    defaultOpen,
    internalActiveSnapPoint,
    open,
  ]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !controlledActiveSnapPoint) {
      setInternalActiveSnapPoint(defaultDrawerActiveSnapPoint);
    }

    onOpenChange?.(nextOpen);
  };

  const handleCancel = () => {
    onCancel?.();
    handleOpenChange(false);
  };
  const snapPointControlProps =
    controlledActiveSnapPoint || drawerActiveSnapPoint !== null
      ? {
          activeSnapPoint: drawerActiveSnapPoint,
          setActiveSnapPoint: setDrawerActiveSnapPoint,
        }
      : {};
  const sheetContent = (
    <Drawer.Portal>
      <AdminScopeBoundary>
        <Drawer.Overlay
          className={cn(
            'bg-overlay-dim data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-[80]',
            overlayClassName,
          )}
        />
        <Drawer.Content
          className={cn(
            'bg-container-neutral fixed right-0 bottom-0 left-0 z-[90] mx-auto flex max-w-[696px] flex-col rounded-t-[20px] outline-none',
            hasSnapPoints ? 'h-dvh' : 'max-h-[calc(100dvh-40px)]',
            className,
          )}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <div
            className={cn(
              'flex min-h-0 flex-col overflow-hidden rounded-t-[20px]',
              hasSnapPoints ? 'h-[calc(100dvh-var(--snap-point-height,0px))]' : 'max-h-full',
            )}
          >
            <div className="relative flex h-7 shrink-0 items-start justify-center pt-300">
              <Drawer.Handle
                className={cn(
                  'absolute inset-0 !m-0 !h-full !w-full !max-w-none rounded-none !bg-transparent !opacity-100',
                  handleClassName,
                )}
              />
              <span className="bg-line pointer-events-none absolute top-300 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full" />
            </div>

            {header && (
              <div
                className={cn(
                  'border-line shrink-0 border-b px-500 pt-200 pb-300',
                  headerClassName,
                )}
              >
                {header}
              </div>
            )}

            <div className={cn('min-h-0 flex-1 overflow-y-auto px-500 py-[14px]', bodyClassName)}>
              {children}
            </div>

            {(footer || showCancelButton) && (
              <div className={cn('shrink-0 px-400 pt-300 pb-800', footerClassName)}>
                {footer ??
                  (showCancelButton && (
                    <Button
                      variant="secondary"
                      size="lg"
                      className="typo-button1 w-full rounded-md"
                      onClick={handleCancel}
                    >
                      {cancelLabel}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </Drawer.Content>
      </AdminScopeBoundary>
    </Drawer.Portal>
  );

  if (resolvedSnapPoints) {
    return (
      <Drawer.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
        direction="bottom"
        modal
        snapPoints={resolvedSnapPoints}
        fadeFromIndex={0}
        {...snapPointControlProps}
      >
        {sheetContent}
      </Drawer.Root>
    );
  }

  return (
    <Drawer.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      direction="bottom"
      modal
      {...snapPointControlProps}
    >
      {sheetContent}
    </Drawer.Root>
  );
}

interface BottomSheetActionItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

function BottomSheetActionItem({
  children,
  destructive = false,
  disabled = false,
  className,
  ...props
}: BottomSheetActionItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'typo-sub1 flex w-full cursor-pointer items-center justify-between rounded-sm py-[14px] text-left disabled:cursor-not-allowed disabled:opacity-40',
        destructive ? 'text-state-error' : 'text-text-normal',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronRightIcon
        aria-hidden
        strokeWidth={2}
        className="text-icon-alternative size-5 shrink-0"
      />
    </button>
  );
}

export { BottomSheet, BottomSheetActionItem };
export type { BottomSheetProps, BottomSheetActionItemProps };
