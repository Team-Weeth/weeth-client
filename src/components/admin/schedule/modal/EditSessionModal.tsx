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
}

/** 그룹/단일 어느 쪽이 와도 PATCH 대상이 되는 sessionId를 결정 */
function resolveSessionId(target: AdminSession | AdminSessionGroup): number | null {
  if (!isSessionGroup(target)) return target.id;
  return target.sessions[0]?.id ?? null;
}

function EditSessionModal({ open, onOpenChange, target }: EditSessionModalProps) {
  const sessionId = resolveSessionId(target);
  const isRecurring = isSessionGroup(target);
  const groupId = isSessionGroup(target) ? target.groupId : null;
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
