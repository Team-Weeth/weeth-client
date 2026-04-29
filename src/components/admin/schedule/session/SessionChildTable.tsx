import { cn } from '@/lib/cn';
import { SessionChildRow } from '@/components/admin/schedule/session/SessionChildRow';
import {
  SESSION_CHILD_INDENT_CLASS,
  SESSION_TABLE_COLUMNS,
} from '@/components/admin/schedule/session/sessionTableColumns';
import type { AdminSession } from '@/types/admin/session';

// 첫 번째 sticky 컬럼(세션 제목)을 제외한 하위 테이블 헤더 컬럼 정의
const HEADER_COLUMNS = [
  { label: '날짜', widthClass: SESSION_TABLE_COLUMNS.childDate.widthClass },
  { label: '상태', widthClass: SESSION_TABLE_COLUMNS.status.widthClass },
  { label: '출석 관리', widthClass: SESSION_TABLE_COLUMNS.attendance.widthClass },
] as const;

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
        <div
          className={cn(
            'bg-container-neutral sticky left-0 z-10 flex items-center',
            SESSION_CHILD_INDENT_CLASS,
            SESSION_TABLE_COLUMNS.titleSticky.widthClass,
          )}
        >
          <div className={SESSION_TABLE_COLUMNS.toggle.widthClass} />
          <div className="flex flex-1 items-center px-400 py-200 pr-600">
            <span className="typo-sub3 text-text-strong">세션 제목</span>
          </div>
        </div>
        {HEADER_COLUMNS.map((col) => (
          <div
            key={col.label}
            className={cn('flex items-center px-400 py-200 pr-600', col.widthClass)}
          >
            <span className="typo-sub3 text-text-strong">{col.label}</span>
          </div>
        ))}
        <div className="flex-1" />
        <div className={SESSION_TABLE_COLUMNS.more.widthClass} />
      </div>

      {sessions.map((session, idx) => (
        <SessionChildRow
          key={session.id}
          session={session}
          order={idx + 1}
          onManageAttendance={onManageAttendance}
          onMore={onMore}
        />
      ))}
    </div>
  );
}

export { SessionChildTable, type SessionChildTableProps };
