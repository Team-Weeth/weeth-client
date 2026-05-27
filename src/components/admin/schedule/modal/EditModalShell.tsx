'use client';

import { Suspense } from 'react';
import type { ReactNode, RefObject } from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SCHEDULE_MODAL_CONTENT_CLASS } from '@/components/admin/schedule/modal/constants';

interface EditModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 닫기 시 변경사항 폐기 확인이 필요한지 외부에서 알려주는 ref */
  hasChangesRef: RefObject<boolean>;
  /** 외부 트리거(닫기 버튼 등)가 모달 닫기 흐름을 가로챌 수 있도록 하는 ref */
  requestCloseRef: RefObject<(() => void) | null>;
  /** Suspense fallback (보통 모달 셸 자체 헤더와 닫기 버튼을 포함한 로딩 뷰) */
  fallback: ReactNode;
  /** Suspense 경계 안에서 fetch + 폼을 그리는 실제 컨텐츠 */
  children: ReactNode;
}

/**
 * EditScheduleModal/EditSessionModal이 공유하는 Dialog 셸.
 * - 외부 닫기 트리거 가로채기 (`requestCloseRef`)
 * - 변경사항 있을 때 outside-pointer-down 막기 (`hasChangesRef`)
 * - Suspense 경계 (children이 detail fetch에 useSuspenseQuery 사용)
 */
function EditModalShell({
  open,
  onOpenChange,
  hasChangesRef,
  requestCloseRef,
  fallback,
  children,
}: EditModalShellProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        if (requestCloseRef.current) requestCloseRef.current();
        else handleClose();
      }}
    >
      <DialogContent
        className={SCHEDULE_MODAL_CONTENT_CLASS}
        showCloseButton={false}
        adminMobileFullscreen={false}
        onPointerDownOutside={(e) => {
          if (hasChangesRef.current) e.preventDefault();
        }}
      >
        <Suspense fallback={fallback}>{children}</Suspense>
      </DialogContent>
    </Dialog>
  );
}

export { EditModalShell, type EditModalShellProps };
