'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { SessionStatusTag } from '@/components/admin/schedule/SessionStatusTag';
import { SessionChildTable } from '@/components/admin/schedule/SessionChildTable';
import { AttendanceLink, MoreButton } from '@/components/admin/schedule/SessionActionButtons';
import { formatSessionDate, formatSessionDateRange } from '@/utils/admin/sessionUtils';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';
import { AdminToggleOpenIcon } from '@/assets/icons/admin';

interface SessionGroupRowProps {
  group: AdminSessionGroup;
  /** 위쪽 row와의 구분선 표시 여부 */
  bordered?: boolean;
  onManageAttendance?: (session: AdminSession | AdminSessionGroup) => void;
  onMore?: (session: AdminSession | AdminSessionGroup) => void;
}

function SessionGroupRow({
  group,
  bordered = false,
  onManageAttendance,
  onMore,
}: SessionGroupRowProps) {
  const hasChildren = group.sessions.length > 0;
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={cn('flex flex-col', bordered && 'border-line border-t')}>
      {/* summary row */}
      <div className="flex h-12 w-full items-center">
        {/* sticky: 토글 + 세션 제목 */}
        <div className="bg-container-neutral sticky left-0 z-10 flex w-[306px] items-center">
          <div className="flex w-[56px] items-center pl-200">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                aria-label={expanded ? '세션 접기' : '세션 펼치기'}
                aria-expanded={expanded}
                className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-200"
              >
                <Icon
                  src={AdminToggleOpenIcon}
                  size={24}
                  className={cn(
                    'text-icon-normal transition-transform duration-200 ease-in',
                    !expanded && '-rotate-90',
                  )}
                />
              </button>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 items-center px-400 py-300 pr-600">
            <span className="typo-body1 text-text-strong truncate">{group.title}</span>
          </div>
        </div>

        <div className="flex w-[206px] items-center px-400 py-300 pr-600">
          <span className="typo-body1 text-text-strong truncate">
            {hasChildren
              ? formatSessionDateRange(group.startDate, group.endDate)
              : formatSessionDate(group.startDate)}
          </span>
        </div>
        <div className="flex w-[241px] items-center px-400 py-300 pr-600">
          {hasChildren && (
            <span className="typo-body1 text-text-strong truncate">
              {group.recurrenceDescription}
            </span>
          )}
        </div>
        <div className="flex w-[102px] items-center px-400 py-300 pr-600">
          <span className="typo-body1 text-text-strong">
            {group.completedCount}/{group.totalCount}
          </span>
        </div>
        <div className="flex w-[102px] items-center px-400 py-300 pr-600">
          <SessionStatusTag status={group.status} />
        </div>
        <div className="flex w-[112px] items-center px-400 py-300 pr-600">
          {!hasChildren && <AttendanceLink onClick={() => onManageAttendance?.(group)} />}
        </div>
        <div className="flex w-[71px] items-center justify-center">
          <MoreButton onClick={() => onMore?.(group)} />
        </div>
      </div>

      {/* 하위 세션 펼침 영역 */}
      {hasChildren && (
        <div
          className={cn(
            'grid w-full overflow-hidden transition-[grid-template-rows] duration-200 ease-in',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0">
            <SessionChildTable
              sessions={group.sessions}
              onManageAttendance={onManageAttendance}
              onMore={onMore}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { SessionGroupRow, type SessionGroupRowProps };
