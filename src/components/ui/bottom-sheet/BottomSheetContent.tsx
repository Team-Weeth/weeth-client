'use client';

import { Drawer } from 'vaul';

import { AdminScopeBoundary } from '@/providers';
import { cn } from '@/lib/cn';
import { Button } from '../Button';
import type { BottomSheetProps } from './bottom-sheet.types';

interface BottomSheetContentProps extends Pick<
  BottomSheetProps,
  | 'children'
  | 'title'
  | 'header'
  | 'footer'
  | 'showCancelButton'
  | 'cancelLabel'
  | 'className'
  | 'overlayClassName'
  | 'handleClassName'
  | 'headerClassName'
  | 'bodyClassName'
  | 'footerClassName'
> {
  hasSnapPoints: boolean;
  onCancel: () => void;
}

function BottomSheetContent({
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
  hasSnapPoints,
}: BottomSheetContentProps) {
  return (
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
                      onClick={onCancel}
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
}

export { BottomSheetContent };
