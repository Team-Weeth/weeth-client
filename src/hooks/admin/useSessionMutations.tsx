'use client';

import { useState } from 'react';

import { CustomAlertDialog } from '@/components/alert';
import {
  isSessionForceRequiredError,
  useCreateSession,
  useDeleteSession,
  useDeleteSessionGroup,
  useUpdateSession,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import type {
  CreateSessionBody,
  SessionUpdateScope,
  UpdateSessionBody,
} from '@/types/admin/session';

/** CLOSED 세션 포함 → force=true 재요청 동의 다이얼로그용 페이로드 */
interface ForceConfirm {
  title: string;
  description: string;
  actionLabel: string;
  retry: () => void;
}

interface SubmitOptions {
  onSuccess?: () => void;
}

/**
 * 세션 create/update/delete/groupDelete mutation을 force=true 재요청 흐름과 함께 묶어 노출.
 * - 호출자는 submitXxx만 부르고, CLOSED 포함 시 다이얼로그가 자동으로 뜸
 * - forceConfirmDialog를 컴포넌트 트리 어딘가에 한 번 렌더링
 * - 각 submit은 per-call onSuccess 콜백을 받아, force 재요청 후 최종 성공 시점에도 호출됨
 */
function useSessionMutations() {
  const [forceConfirm, setForceConfirm] = useState<ForceConfirm | null>(null);

  const { mutate: createSession } = useCreateSession();
  const { mutate: updateSession } = useUpdateSession();
  const { mutate: deleteSession } = useDeleteSession();
  const { mutate: deleteSessionGroup } = useDeleteSessionGroup();

  const submitCreate = (body: CreateSessionBody, options?: SubmitOptions) => {
    createSession(body, {
      onSuccess: () => options?.onSuccess?.(),
    });
  };

  const submitUpdate = (
    sessionId: number,
    body: UpdateSessionBody,
    scope: SessionUpdateScope,
    force = false,
    options?: SubmitOptions,
  ) => {
    updateSession(
      { sessionId, body, scope, force },
      {
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => {
          if (!force && isSessionForceRequiredError(error)) {
            setForceConfirm({
              title: '종료된 세션이 포함되어 있어요',
              description:
                scope === 'THIS_AND_FUTURE'
                  ? '이후 일정 중 이미 종료된 세션도 함께 수정할까요?'
                  : '이미 종료된 세션이에요. 그래도 수정할까요?',
              actionLabel: scope === 'THIS_AND_FUTURE' ? '모두 수정' : '수정',
              retry: () => submitUpdate(sessionId, body, scope, true, options),
            });
          }
        },
      },
    );
  };

  const submitDeleteSession = (
    sessionId: number,
    scope: SessionUpdateScope,
    force = false,
    options?: SubmitOptions,
  ) => {
    deleteSession(
      { sessionId, scope, force },
      {
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => {
          if (!force && isSessionForceRequiredError(error)) {
            setForceConfirm({
              title: '출석 데이터가 있어요',
              description:
                scope === 'THIS_AND_FUTURE'
                  ? '이후 일정 중 출석 데이터가 있는 세션이 있어요.\n삭제하면 출석 데이터도 함께 사라져요.'
                  : '출석 데이터가 있는 세션이에요. 그래도 삭제할까요?\n삭제하면 출석 데이터도 함께 사라져요.',
              actionLabel: scope === 'THIS_AND_FUTURE' ? '모두 삭제' : '삭제',
              retry: () => submitDeleteSession(sessionId, scope, true, options),
            });
          }
        },
      },
    );
  };

  const submitDeleteGroup = (groupId: number, force = false, options?: SubmitOptions) => {
    deleteSessionGroup(
      { groupId, force },
      {
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => {
          if (!force && isSessionForceRequiredError(error)) {
            setForceConfirm({
              title: '출석 데이터가 있어요',
              description:
                '출석 데이터가 있는 세션이 포함되어 있어요.\n삭제하면 출석 데이터도 함께 사라져요.',
              actionLabel: '모두 삭제',
              retry: () => submitDeleteGroup(groupId, true, options),
            });
          }
        },
      },
    );
  };

  const forceConfirmDialog = (
    <CustomAlertDialog
      open={!!forceConfirm}
      onOpenChange={(open) => {
        if (!open) setForceConfirm(null);
      }}
      title={forceConfirm?.title ?? ''}
      description={forceConfirm?.description ?? ''}
      actionLabel={forceConfirm?.actionLabel ?? '확인'}
      cancelLabel="취소"
      onAction={() => {
        if (!forceConfirm) return;
        const { retry } = forceConfirm;
        setForceConfirm(null);
        retry();
      }}
      placement="center"
      tone="primary"
    />
  );

  return {
    submitCreate,
    submitUpdate,
    submitDeleteSession,
    submitDeleteGroup,
    forceConfirmDialog,
  };
}

export { useSessionMutations };
