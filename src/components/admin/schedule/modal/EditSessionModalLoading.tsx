'use client';

import { Skeleton } from '@/components/ui';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { ModalIconButton } from '@/components/admin';
import { SCHEDULE_MODAL_FOOTER_CLASS } from './constants';

interface EditSessionModalLoadingProps {
  onClose: () => void;
}

function EditSessionModalLoading({ onClose }: EditSessionModalLoadingProps) {
  return (
    <>
      <div className="tablet:px-700 tablet:pt-700 flex items-start justify-between px-400 pt-400">
        <div className="flex h-8 items-end">
          <span className="typo-button2 text-text-strong border-brand-primary border-b-2 px-100 pb-200">
            세션
          </span>
        </div>
        <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={onClose} />
      </div>
      <div className="scrollbar-custom tablet:px-700 min-h-0 flex-1 touch-pan-y overflow-y-auto px-400">
        <Skeleton className="mt-400 mb-200 h-8 w-28" />
        <div className="flex flex-col gap-400 py-400">
          <Skeleton className="h-10 w-full rounded-sm" />
          <SessionModalFieldSkeleton />
          <SessionModalFieldSkeleton inputHeight="h-9" inputWidth="w-30" />
          <SessionModalFieldSkeleton inputHeight="h-[88px]" />
          <SessionModalFieldSkeleton inputHeight="h-9" inputWidth="w-30" />
          <SessionModalFieldSkeleton />
          <SessionModalFieldSkeleton inputHeight="h-28" />
        </div>
      </div>
      <div className={SCHEDULE_MODAL_FOOTER_CLASS}>
        <Skeleton className="max-tablet:flex-1 h-12 w-20 rounded-sm" />
        <Skeleton className="max-tablet:flex-1 h-12 w-16 rounded-sm" />
      </div>
    </>
  );
}

function SessionModalFieldSkeleton({
  inputHeight = 'h-12',
  inputWidth = 'w-full',
}: {
  inputHeight?: string;
  inputWidth?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex h-12 items-center px-400">
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className={`${inputHeight} ${inputWidth} rounded-sm`} />
    </div>
  );
}

export { EditSessionModalLoading, type EditSessionModalLoadingProps };
