import { SessionStatusTag } from '@/components/admin/schedule/SessionStatusTag';
import { AttendanceLink, MoreButton } from '@/components/admin/schedule/SessionActionButtons';
import {
  formatSessionDate,
  formatSessionDayLabel,
  formatSessionTimeRange,
} from '@/utils/admin/sessionUtils';
import type { AdminSession } from '@/types/admin/session';

interface SessionChildTableProps {
  sessions: AdminSession[];
  onManageAttendance?: (session: AdminSession) => void;
  onMore?: (session: AdminSession) => void;
}

function SessionChildTable({ sessions, onManageAttendance, onMore }: SessionChildTableProps) {
  return (
    <div className="border-line flex w-full flex-col border-t pt-300 pb-400">
      {/* 하위 테이블 헤더 */}
      <div className="flex h-10 w-full items-center">
        <div className="flex min-w-0 flex-1 items-center px-400 py-200 pr-600">
          <span className="typo-sub3 text-text-strong">세션 제목</span>
        </div>
        <div className="flex w-[566px] items-center px-400 py-200 pr-600">
          <span className="typo-sub3 text-text-strong">날짜</span>
        </div>
        <div className="flex w-[102px] items-center px-400 py-200 pr-600">
          <span className="typo-sub3 text-text-strong">상태</span>
        </div>
        <div className="flex w-[112px] items-center px-400 py-200 pr-600">
          <span className="typo-sub3 text-text-strong">출석 관리</span>
        </div>
        <div className="w-[71px]" />
      </div>

      {sessions.map((session, idx) => (
        <div key={session.id} className="flex h-10 w-full items-center">
          <div className="flex items-center pl-200">
            <div className="flex size-10 items-center justify-center">
              <span className="typo-body1 text-text-alternative">{idx + 1}</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-1 items-center px-400 py-300 pr-600">
              <span className="typo-body1 text-text-strong truncate">{session.title}</span>
            </div>
            <div className="flex w-[566px] items-center gap-300 px-400 py-300 pr-600">
              <span className="typo-body1 text-text-strong w-20 shrink-0">
                {formatSessionDate(session.start)}
              </span>
              <span className="typo-body1 text-text-strong w-[41px] shrink-0">
                {formatSessionDayLabel(session.start)}
              </span>
              <span className="typo-body1 text-text-strong flex-1 truncate">
                {formatSessionTimeRange(session.start, session.end)}
              </span>
            </div>
            <div className="flex w-[102px] items-center px-400 py-300 pr-600">
              <SessionStatusTag status={session.status} />
            </div>
            <div className="flex w-[112px] items-center px-400 pr-600">
              <AttendanceLink onClick={() => onManageAttendance?.(session)} />
            </div>
            <div className="flex w-[71px] items-center justify-center">
              <MoreButton onClick={() => onMore?.(session)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { SessionChildTable, type SessionChildTableProps };
