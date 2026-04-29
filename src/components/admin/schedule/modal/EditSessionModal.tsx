'use client';

import { useRef } from 'react';

import { isSessionGroup } from '@/utils/admin/scheduleFormUtils';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

import { EditModalShell } from './EditModalShell';
import { EditSessionModalContent } from './EditSessionModalContent';
import { EditSessionModalLoading } from './EditSessionModalLoading';

interface EditSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AdminSession | AdminSessionGroup;
  /**
   * 반복 그룹의 자식 세션을 수정할 때 부모 그룹 컨텍스트.
   * 전달되면 isRecurring=true로 처리되어 스코프 다이얼로그가 표시된다.
   */
  parentGroup?: AdminSessionGroup;
}

/** 그룹/단일 어느 쪽이 와도 PATCH 대상이 되는 sessionId를 결정 */
function resolveSessionId(target: AdminSession | AdminSessionGroup): number | null {
  if (!isSessionGroup(target)) return target.id;
  return target.sessions[0]?.id ?? null;
}

function EditSessionModal({ open, onOpenChange, target, parentGroup }: EditSessionModalProps) {
  const sessionId = resolveSessionId(target);
  const isChildOfRecurringGroup = !isSessionGroup(target) && parentGroup !== undefined;
  const isRecurring = isSessionGroup(target) || isChildOfRecurringGroup;
  const groupId = isSessionGroup(target)
    ? target.groupId
    : (parentGroup?.groupId ?? null);
  const hasChangesRef = useRef(false);
  const requestCloseRef = useRef<(() => void) | null>(null);

  const handleClose = () => onOpenChange(false);

  return (
    <EditModalShell
      open={open}
      onOpenChange={onOpenChange}
      hasChangesRef={hasChangesRef}
      requestCloseRef={requestCloseRef}
      fallback={<EditSessionModalLoading onClose={handleClose} />}
    >
      {sessionId === null ? (
        <EditSessionModalLoading onClose={handleClose} />
      ) : (
        <EditSessionModalContent
          sessionId={sessionId}
          isRecurring={isRecurring}
          isChildOfRecurringGroup={isChildOfRecurringGroup}
          groupId={groupId}
          onClose={handleClose}
          hasChangesRef={hasChangesRef}
          requestCloseRef={requestCloseRef}
        />
      )}
    </EditModalShell>
  );
}

export { EditSessionModal, type EditSessionModalProps };
