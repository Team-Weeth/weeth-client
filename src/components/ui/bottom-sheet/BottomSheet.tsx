'use client';

import { Drawer } from 'vaul';

import { useBottomSheetActiveSnapPoint } from '@/hooks/useBottomSheetActiveSnapPoint';
import { useBottomSheetSnapPoints } from '@/hooks/useBottomSheetSnapPoints';
import { BottomSheetActionItem } from './BottomSheetActionItem';
import { BottomSheetContent } from './BottomSheetContent';
import type { BottomSheetProps, BottomSheetActionItemProps } from './bottom-sheet.types';

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
  closeThreshold,
  scrollLockTimeout,
}: BottomSheetProps) {
  const { resolvedSnapPoints, hasSnapPoints } = useBottomSheetSnapPoints({
    expandable,
    initialSnapHeight,
    topGap,
    snapPoints,
  });
  const { handleOpenChange, snapPointControlProps } = useBottomSheetActiveSnapPoint({
    open,
    defaultOpen,
    onOpenChange,
    resolvedSnapPoints,
    defaultActiveSnapPoint,
    activeSnapPoint,
    setActiveSnapPoint,
  });

  const handleCancel = () => {
    onCancel?.();
    handleOpenChange(false);
  };

  const sheetContent = (
    <BottomSheetContent
      title={title}
      header={header}
      footer={footer}
      showCancelButton={showCancelButton}
      cancelLabel={cancelLabel}
      onCancel={handleCancel}
      className={className}
      overlayClassName={overlayClassName}
      handleClassName={handleClassName}
      headerClassName={headerClassName}
      bodyClassName={bodyClassName}
      footerClassName={footerClassName}
      hasSnapPoints={hasSnapPoints}
    >
      {children}
    </BottomSheetContent>
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
        closeThreshold={closeThreshold}
        scrollLockTimeout={scrollLockTimeout}
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
      closeThreshold={closeThreshold}
      scrollLockTimeout={scrollLockTimeout}
      {...snapPointControlProps}
    >
      {sheetContent}
    </Drawer.Root>
  );
}

export { BottomSheet, BottomSheetActionItem };
export type { BottomSheetProps, BottomSheetActionItemProps };
