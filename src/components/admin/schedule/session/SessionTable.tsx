import { cn } from '@/lib/cn';
import { SessionGroupRow } from '@/components/admin/schedule/session/SessionGroupRow';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

// 첫 번째 sticky 컬럼(세션 제목)을 제외한 헤더 컬럼 정의
const HEADER_COLUMNS = [
  { label: '날짜', widthClass: 'w-[206px]' },
  { label: '반복 설정', widthClass: 'w-[241px]' },
  { label: '진행 차수', widthClass: 'w-[102px]' },
  { label: '상태', widthClass: 'w-[102px]' },
  { label: '출석 관리', widthClass: 'w-[112px]' },
] as const;

interface SessionTableProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: AdminSessionGroup[];
  /** 출석 관리는 개별 세션(AdminSession) id 기반 동작이므로 세션만 받는다 */
  onManageAttendance?: (session: AdminSession) => void;
  /** 수정 대상은 그룹 전체 또는 개별 하위 세션 모두 가능 */
  onMore?: (target: AdminSession | AdminSessionGroup) => void;
}

function SessionTable({
  className,
  groups,
  onManageAttendance,
  onMore,
  ...props
}: SessionTableProps) {
  return (
    <div className={cn('border-line overflow-x-auto rounded-sm border', className)} {...props}>
      <div className="min-w-[1140px]">
        {/* 테이블 헤더 */}
        <div className="bg-container-neutral-alternative border-line flex w-full items-center border-b">
          <div className="bg-container-neutral-alternative sticky left-0 z-10 flex w-[306px] items-center">
            <div className="w-[56px]" />
            <div className="flex flex-1 items-center px-400 py-[15px] pr-600">
              <span className="typo-sub3 text-text-alternative">세션 제목</span>
            </div>
          </div>
          {HEADER_COLUMNS.map((col) => (
            <div
              key={col.label}
              className={cn('flex items-center px-400 py-[15px] pr-600', col.widthClass)}
            >
              <span className="typo-sub3 text-text-alternative">{col.label}</span>
            </div>
          ))}
          <div className="w-[71px]" />
        </div>

        {/* 세션 그룹 목록 */}
        {groups.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center">
            <p className="typo-body2 text-text-alternative">등록된 세션이 없습니다.</p>
          </div>
        ) : (
          groups.map((group, index) => (
            <SessionGroupRow
              key={group.groupId}
              group={group}
              bordered={index > 0}
              onManageAttendance={onManageAttendance}
              onMore={onMore}
            />
          ))
        )}
      </div>
    </div>
  );
}

export { SessionTable, type SessionTableProps };
