'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { SessionStatusTag } from '@/components/admin/schedule/session/SessionStatusTag';
import EditIcon from '@/assets/icons/edit.svg';
import ToggleOpenIcon from '@/assets/icons/admin/ic_admin_toggle_open.svg';
import SmArrowRightIcon from '@/assets/icons/admin/ic_admin_sm_arrow_right.svg';
import { deriveSessionStatus } from '@/utils/admin/sessionUtils';
import {
  formatGroupDateRange,
  formatTimeRange,
  isRepeating,
} from '@/utils/admin/sessionScheduleListUtils';
import { useClubId } from '@/stores';
import type { AdminSessionGroup } from '@/types/admin/session';

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
  return (
    <div className="bg-button-neutral relative h-[6px] w-full overflow-hidden rounded-[99px]">
      <div
        className="bg-brand-primary absolute inset-y-0 left-0 rounded-[99px]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface SessionGroupRowProps {
  group: AdminSessionGroup;
  expanded: boolean;
  onToggle: () => void;
  onEdit?: (group: AdminSessionGroup) => void;
}

function SessionGroupRow({ group, expanded, onToggle, onEdit }: SessionGroupRowProps) {
  const router = useRouter();
  const clubId = useClubId();
  const repeating = isRepeating(group);
  const firstSession = group.sessions[0];
  const derivedStatus = deriveSessionStatus(
    group.status,
    group.startDate,
    group.endDate ?? group.startDate,
  );
  const showProgress = derivedStatus !== 'COMPLETED' && group.totalCount > 0;
  const isOpen = derivedStatus === 'OPEN';

  // 반복 세션은 h-[80px], 단일 세션은 h-[50px]
  const cellH = repeating ? 'h-[80px]' : 'h-[50px]';

  return (
    <div className="bg-container-neutral flex items-center">
      {/* 세션 제목 */}
      <div
        className={cn(
          'flex max-w-[240px] min-w-[200px] flex-1 flex-col items-start justify-center gap-100 px-600 py-300',
          cellH,
        )}
      >
        <div className="flex items-center gap-100">
          <span className="typo-sub3 text-text-strong truncate">{group.title}</span>
          {repeating && (
            <span className="typo-caption1 bg-state-success/10 text-state-success h-6 shrink-0 rounded-[999px] px-200 py-100">
              반복
            </span>
          )}
        </div>
        {repeating && group.groupId !== null && group.sessions.length > 1 && (
          <button
            type="button"
            onClick={onToggle}
            className="typo-caption2 text-text-alternative flex cursor-pointer items-center gap-[2px]"
          >
            <span>{expanded ? '회차 접기' : '회차 펼치기'}</span>
            <Icon
              src={ToggleOpenIcon}
              size={18}
              className={cn(
                'text-text-alternative transition-transform duration-200',
                expanded && 'rotate-180',
              )}
            />
          </button>
        )}
      </div>

      {/* 날짜 */}
      <div
        className={cn(
          'flex max-w-[170px] min-w-[150px] flex-1 items-center py-300 pr-600 pl-400',
          cellH,
        )}
      >
        <span className="typo-body1 text-text-strong">
          {formatGroupDateRange(group.startDate, group.endDate)}
        </span>
      </div>

      {/* 반복·시간 */}
      <div className={cn('flex min-w-[140px] flex-1 items-center py-300 pr-600 pl-400', cellH)}>
        {repeating ? (
          <div className="flex flex-col gap-[2px]">
            <span className="typo-body1 text-text-strong whitespace-nowrap">
              {group.recurrenceDescription}
            </span>
            {firstSession && (
              <span className="typo-body1 text-text-normal whitespace-nowrap">
                {formatTimeRange(firstSession.start, firstSession.end)}
              </span>
            )}
          </div>
        ) : (
          <span className="typo-body1 text-text-strong">단일</span>
        )}
      </div>

      {/* 진행 */}
      <div
        className={cn(
          'flex max-w-[220px] min-w-[204px] flex-1 flex-col justify-center gap-200 py-300 pr-600 pl-400',
          cellH,
        )}
      >
        <span className="typo-body1 text-text-strong whitespace-nowrap">
          {group.completedCount} / {group.totalCount}회
        </span>
        {repeating && showProgress && (
          <ProgressBar completed={group.completedCount} total={group.totalCount} />
        )}
      </div>

      {/* 상태 */}
      <div className={cn('flex w-[110px] shrink-0 items-center py-300 pr-600 pl-400', cellH)}>
        <SessionStatusTag status={derivedStatus} />
      </div>

      {/* 출석 관리: 반복 세션은 숨김, 단일 세션은 표시 */}
      <div
        className={cn(
          'flex max-w-[200px] min-w-[160px] flex-1 items-center py-[13px] pr-600 pl-400',
          cellH,
        )}
      >
        {!repeating && (
          // TODO: 연결된 세션의 출석 관리 탭으로 바로 이동하도록 수정 필요 (예: /${clubId}/admin/attendance?sessionId=${group.sessions[0]?.id})
          <button
            type="button"
            onClick={() => router.push(`/${clubId}/admin/attendance`)}
            className={cn(
              'typo-sub3 group flex cursor-pointer items-center gap-100',
              isOpen
                ? 'text-brand-primary'
                : 'text-text-alternative hover:text-text-normal active:text-text-strong',
            )}
          >
            <span>출석 관리</span>
            <Icon
              src={SmArrowRightIcon}
              size={16}
              className={cn(
                isOpen
                  ? 'text-brand-primary'
                  : 'text-text-alternative group-hover:text-text-normal group-active:text-text-strong',
              )}
            />
          </button>
        )}
      </div>

      {/* 수정 */}
      <div className={cn('flex w-[70px] shrink-0 items-center justify-center self-stretch', cellH)}>
        <button
          type="button"
          onClick={() => onEdit?.(group)}
          aria-label="수정"
          className="group cursor-pointer"
        >
          <Icon
            src={EditIcon}
            size={20}
            className="text-icon-alternative group-hover:text-icon-normal group-active:text-icon-strong"
          />
        </button>
      </div>
    </div>
  );
}

export { SessionGroupRow, type SessionGroupRowProps };
