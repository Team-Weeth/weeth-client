'use client';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { SessionStatusTag } from '@/components/admin/schedule/session/SessionStatusTag';
import EditIcon from '@/assets/icons/edit.svg';
import SubdirectoryArrowRightIcon from '@/assets/icons/admin/ic_subdirectory_arrow_right.svg';
import SmArrowRightIcon from '@/assets/icons/admin/ic_admin_sm_arrow_right.svg';
import { deriveChildSessionStatus } from '@/utils/admin/sessionUtils';
import { formatSessionDate, formatTimeRange } from '@/utils/admin/sessionScheduleListUtils';
import type { AdminSession } from '@/types/admin/session';

interface SessionChildRowProps {
  session: AdminSession;
  isLast: boolean;
  onEdit?: (session: AdminSession) => void;
}

function SessionChildRow({ session, isLast, onEdit }: SessionChildRowProps) {
  const derivedStatus = deriveChildSessionStatus(session.status, session.start);
  const isOpen = derivedStatus === 'OPEN';

  return (
    <div
      className={cn(
        'border-line bg-container-neutral flex h-[50px] items-center border-t',
        isLast && 'border-b-0',
      )}
    >
      {/* 세션 제목 */}
      <div className="flex max-w-[240px] min-w-[200px] flex-1 items-center gap-200 py-[2px] pr-600 pl-[30px]">
        <Icon
          src={SubdirectoryArrowRightIcon}
          size={16}
          className="text-text-alternative shrink-0"
        />
        <span className="typo-body1 text-text-strong truncate">{session.title}</span>
      </div>

      {/* 날짜 */}
      <div className="flex max-w-[170px] min-w-[150px] flex-1 items-center py-300 pr-600 pl-400">
        <span className="typo-body1 text-text-strong">{formatSessionDate(session.start)}</span>
      </div>

      {/* 반복·시간 */}
      <div className="flex min-w-[140px] flex-1 items-center py-300 pr-600 pl-400">
        <span className="typo-body1 text-text-strong">
          {formatTimeRange(session.start, session.end)}
        </span>
      </div>

      {/* 진행 (empty) */}
      <div className="max-w-[220px] min-w-[204px] flex-1" />

      {/* 상태 */}
      <div className="flex h-full w-[110px] shrink-0 items-center py-[13px] pr-600 pl-400">
        <SessionStatusTag status={derivedStatus} />
      </div>

      {/* 출석 관리 */}
      <div className="flex h-full max-w-[200px] min-w-[160px] flex-1 items-center py-[13px] pr-600 pl-400">
        <button
          type="button"
          className={cn(
            'typo-sub3 flex items-center gap-100',
            isOpen ? 'text-brand-primary' : 'text-text-alternative',
          )}
        >
          <span>출석 관리</span>
          <Icon
            src={SmArrowRightIcon}
            size={16}
            className={isOpen ? 'text-brand-primary' : 'text-text-alternative'}
          />
        </button>
      </div>

      {/* 수정 */}
      <div className="flex h-full w-[70px] shrink-0 items-center justify-center">
        <button type="button" onClick={() => onEdit?.(session)}>
          <Icon src={EditIcon} size={20} className="text-icon-alternative" />
        </button>
      </div>
    </div>
  );
}

export { SessionChildRow, type SessionChildRowProps };
