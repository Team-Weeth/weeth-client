'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui';
import { AdminCalendarEditIcon } from '@/assets/icons/admin';
import { SessionTable } from '@/components/admin/schedule/session/SessionTable';
import { EditSessionModal } from '@/components/admin/schedule/modal/EditSessionModal';
import { useAdminSessionList } from '@/hooks/queries/admin';
import { toastError } from '@/stores/useToastStore';
import { isSessionGroup } from '@/utils/admin/scheduleFormUtils';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';
import SessionInfobanner from './SessionInfoBanner';

interface SessionTabContentProps {
  onCreateSession?: () => void;
  /** 출석 관리는 개별 세션(AdminSession) id 기반 동작 */
  onManageAttendance?: (session: AdminSession) => void;
  /** 선택된 기수 (없으면 전체) */
  cardinalNumber?: number | null;
}

interface EditTargetState {
  target: AdminSession | AdminSessionGroup;
  /** 자식 세션을 수정할 때 부모 반복 그룹 컨텍스트 (스코프 다이얼로그 표시용) */
  parentGroup?: AdminSessionGroup;
}

function SessionTabContent({
  onCreateSession,
  onManageAttendance,
  cardinalNumber,
}: SessionTabContentProps) {
  const { data } = useAdminSessionList(cardinalNumber);
  const sessions = data?.sessions ?? [];

  const [editTarget, setEditTarget] = useState<EditTargetState | null>(null);

  /** 그룹에 세션이 0개면 PATCH/DELETE 대상이 없으므로 모달 진입 차단 */
  const handleOpenEdit = (
    target: AdminSession | AdminSessionGroup,
    parentGroup?: AdminSessionGroup,
  ) => {
    if (isSessionGroup(target) && target.sessions.length === 0) {
      toastError('수정·삭제 가능한 세션이 없습니다.');
      return;
    }
    setEditTarget({ target, parentGroup });
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
            onMore={handleOpenEdit}
          />
        </div>
      </div>

      {/* 세션 수정 모달 — mutation은 모달이 직접 소유 */}
      {editTarget && (
        <EditSessionModal
          key={
            'groupId' in editTarget.target ? editTarget.target.groupId : editTarget.target.id
          }
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditTarget(null);
          }}
          target={editTarget.target}
          parentGroup={editTarget.parentGroup}
        />
      )}
    </div>
  );
}

export { SessionTabContent, type SessionTabContentProps };
