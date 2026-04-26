'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button, Icon } from '@/components/ui';
import { CustomAlertDialog } from '@/components/alert';
import { AdminCalendarEditIcon } from '@/assets/icons/admin';
import { SessionTable } from '@/components/admin/schedule/session/SessionTable';
import { EditSessionModal } from '@/components/admin/schedule/modal/EditSessionModal';
import { useAdminSessionList } from '@/hooks/queries/admin';
import {
  isSessionForceRequiredError,
  useUpdateSession,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import type {
  AdminSession,
  AdminSessionGroup,
  SessionUpdateScope,
  UpdateSessionBody,
} from '@/types/admin/session';
import SessionInfobanner from './SessionInfoBanner';

interface SessionTabContentProps {
  onCreateSession?: () => void;
  /** 출석 관리는 개별 세션(AdminSession) id 기반 동작 */
  onManageAttendance?: (session: AdminSession) => void;
  /** 선택된 기수 (없으면 전체) */
  cardinalNumber?: number | null;
}

function SessionTabContent({
  onCreateSession,
  onManageAttendance,
  cardinalNumber,
}: SessionTabContentProps) {
  const { data } = useAdminSessionList(cardinalNumber);
  const sessions = data?.sessions ?? [];

  const [editTarget, setEditTarget] = useState<AdminSession | AdminSessionGroup | null>(null);
  /** scope=THIS_AND_FUTURE인데 CLOSED 세션이 끼어 force=true 재요청 동의가 필요할 때만 채워짐 */
  const [forceConfirm, setForceConfirm] = useState<{
    sessionId: number;
    body: UpdateSessionBody;
    scope: SessionUpdateScope;
  } | null>(null);

  const { mutate: updateSession } = useUpdateSession();

  const submitUpdate = (
    sessionId: number,
    body: UpdateSessionBody,
    scope: SessionUpdateScope,
    force: boolean,
  ) => {
    updateSession(
      { sessionId, body, scope, force },
      {
        onError: (error) => {
          if (!force && scope === 'THIS_AND_FUTURE' && isSessionForceRequiredError(error)) {
            setForceConfirm({ sessionId, body, scope });
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-400">
      {/* 알림 배너 */}
      <SessionInfobanner />

      {/* 세션 카드 */}
      <div className="bg-container-neutral flex flex-col rounded-lg shadow-sm">
        {/* 카드 헤더 */}
        <div className="flex h-[72px] items-center justify-between px-600">
          <span className="typo-sub3 text-text-normal">세션</span>
          <Button variant="primary" size="lg" onClick={onCreateSession}>
            <Image src={AdminCalendarEditIcon} alt="" width={20} height={20} className="mr-1" />
            세션 생성
          </Button>
        </div>

        {/* 카드 body */}
        <div className="p-600 pt-0">
          <SessionTable
            groups={sessions}
            onManageAttendance={onManageAttendance}
            onMore={setEditTarget}
          />
        </div>
      </div>

      {/* 세션 수정 모달 */}
      {editTarget && (
        <EditSessionModal
          key={'groupId' in editTarget ? editTarget.groupId : editTarget.id}
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditTarget(null);
          }}
          target={editTarget}
          onSave={(sessionId, body, type) => {
            const scope: SessionUpdateScope = type === 'all' ? 'THIS_AND_FUTURE' : 'THIS_ONLY';
            submitUpdate(sessionId, body, scope, false);
          }}
          onDelete={(_type) => {
            // TODO: API 연동 시 type에 따라 'this'=단일 삭제, 'all'=이후 모두 삭제 호출
            setEditTarget(null);
          }}
        />
      )}

      {/* CLOSED 세션 포함 시 force=true 재요청 동의 */}
      <CustomAlertDialog
        open={!!forceConfirm}
        onOpenChange={(open) => {
          if (!open) setForceConfirm(null);
        }}
        title="종료된 세션이 포함되어 있어요"
        description={'이후 일정 중 이미 종료된 세션도 함께 수정할까요?'}
        actionLabel="모두 수정"
        cancelLabel="취소"
        onAction={() => {
          if (!forceConfirm) return;
          const { sessionId, body, scope } = forceConfirm;
          setForceConfirm(null);
          submitUpdate(sessionId, body, scope, true);
        }}
        placement="center"
        tone="primary"
      />
    </div>
  );
}

export { SessionTabContent, type SessionTabContentProps };
