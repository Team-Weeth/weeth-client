import { cn } from '@/lib/cn';
import { SessionGroupRow } from '@/components/admin/schedule/session/SessionGroupRow';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

interface SessionTableProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: AdminSessionGroup[];
  onManageAttendance?: (target: AdminSession | AdminSessionGroup) => void;
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
    <div
      className={cn('border-line overflow-x-auto rounded-sm border', className)}
      {...props}
    >
      <div className="min-w-[1140px]">
        {/* 테이블 헤더 */}
        <div className="bg-container-neutral-alternative border-line flex w-full items-center border-b">
          <div className="bg-container-neutral-alternative sticky left-0 z-10 flex w-[306px] items-center">
            <div className="w-[56px]" />
            <div className="flex flex-1 items-center px-400 py-[15px] pr-600">
              <span className="typo-sub3 text-text-alternative">세션 제목</span>
            </div>
          </div>
          <div className="flex w-[206px] items-center px-400 py-[15px] pr-600">
            <span className="typo-sub3 text-text-alternative">날짜</span>
          </div>
          <div className="flex w-[241px] items-center px-400 py-[15px] pr-600">
            <span className="typo-sub3 text-text-alternative">반복 설정</span>
          </div>
          <div className="flex w-[102px] items-center px-400 py-[15px] pr-600">
            <span className="typo-sub3 text-text-alternative">진행 차수</span>
          </div>
          <div className="flex w-[102px] items-center px-400 py-[15px] pr-600">
            <span className="typo-sub3 text-text-alternative">상태</span>
          </div>
          <div className="flex w-[112px] items-center px-400 py-[15px] pr-600">
            <span className="typo-sub3 text-text-alternative">출석 관리</span>
          </div>
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
