'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button, Icon } from '@/components/ui';
import { AdminCalendarEditIcon } from '@/assets/icons/admin';
import { SessionTable } from '@/components/admin/schedule/session/SessionTable';
import { EditSessionModal } from '@/components/admin/schedule/modal/EditSessionModal';
import { MOCK_SESSION_LIST } from '@/constants/admin/session.constants';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';
import SessionInfobanner from './SessionInfoBanner';

interface SessionTabContentProps {
  onCreateSession?: () => void;
  /** 출석 관리는 개별 세션(AdminSession) id 기반 동작 */
  onManageAttendance?: (session: AdminSession) => void;
}

function SessionTabContent({ onCreateSession, onManageAttendance }: SessionTabContentProps) {
  // TODO: API 연결 시 useAdminSessionList() 같은 훅으로 교체
  const { sessions } = MOCK_SESSION_LIST;

  const [editTarget, setEditTarget] = useState<AdminSession | AdminSessionGroup | null>(null);

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
          onDelete={(_type) => {
            // TODO: API 연동 시 type에 따라 'this'=단일 삭제, 'all'=이후 모두 삭제 호출
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}

export { SessionTabContent, type SessionTabContentProps };
