import { cn } from '@/lib/cn';
import { SessionStatusTag } from '@/components/admin/schedule/session/SessionStatusTag';
import {
  AttendanceLink,
  MoreButton,
} from '@/components/admin/schedule/session/SessionActionButtons';
import { SESSION_TABLE_COLUMNS } from '@/components/admin/schedule/session/sessionTableColumns';
import {
  deriveChildSessionStatus,
  formatSessionDate,
  formatSessionDayLabel,
  formatSessionTimeRange,
} from '@/utils/admin/sessionUtils';
import type { AdminSession } from '@/types/admin/session';

interface SessionChildRowProps {
  session: AdminSession;
  /** 좌측에 표시할 1-based 순번 */
  order: number;
  onManageAttendance?: (session: AdminSession) => void;
  onMore?: (session: AdminSession) => void;
}

function SessionChildRow({ session, order, onManageAttendance, onMore }: SessionChildRowProps) {
  const derivedStatus = deriveChildSessionStatus(session.status, session.start);

  return (
    <div className="flex h-10 w-full items-center">
      <div
        className={cn(
          'bg-container-neutral sticky left-0 z-10 flex items-center pl-[64px]',
          SESSION_TABLE_COLUMNS.titleSticky.widthClass,
        )}
      >
        <div className={cn('flex items-center pl-200', SESSION_TABLE_COLUMNS.toggle.widthClass)}>
          <div className="flex size-10 items-center justify-center">
            <span className="typo-body1 text-text-alternative">{order}</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-center px-400 py-300 pr-600">
          <span className="typo-body1 text-text-strong truncate">{session.title}</span>
        </div>
      </div>
      <div
        className={cn(
          'flex items-center gap-300 px-400 py-300 pr-600',
          SESSION_TABLE_COLUMNS.childDate.widthClass,
        )}
      >
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
      <div
        className={cn(
          'flex items-center px-400 py-300 pr-600',
          SESSION_TABLE_COLUMNS.status.widthClass,
        )}
      >
        <SessionStatusTag status={derivedStatus} />
      </div>
      <div
        className={cn(
          'flex items-center px-400 pr-600',
          SESSION_TABLE_COLUMNS.attendance.widthClass,
        )}
      >
        <AttendanceLink status={derivedStatus} onClick={() => onManageAttendance?.(session)} />
      </div>
      <div className="flex-1" />
      <div
        className={cn('flex items-center justify-center', SESSION_TABLE_COLUMNS.more.widthClass)}
      >
        <MoreButton onClick={() => onMore?.(session)} />
      </div>
    </div>
  );
}

export { SessionChildRow, type SessionChildRowProps };
