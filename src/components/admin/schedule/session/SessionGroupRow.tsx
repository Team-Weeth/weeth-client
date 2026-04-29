'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { SessionStatusTag } from '@/components/admin/schedule/session/SessionStatusTag';
import { SessionChildTable } from '@/components/admin/schedule/session/SessionChildTable';
import {
  AttendanceLink,
  MoreButton,
} from '@/components/admin/schedule/session/SessionActionButtons';
import { SESSION_TABLE_COLUMNS } from '@/components/admin/schedule/session/sessionTableColumns';
import {
  deriveSessionStatus,
  formatSessionDate,
  formatSessionDateRange,
} from '@/utils/admin/sessionUtils';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';
import { AdminToggleOpenIcon } from '@/assets/icons/admin';

interface SessionGroupRowProps {
  group: AdminSessionGroup;
  /** 위쪽 row와의 구분선 표시 여부 */
  bordered?: boolean;
  /** 출석 관리는 개별 세션(AdminSession) id 기반 동작 */
  onManageAttendance?: (session: AdminSession) => void;
  /**
   * 수정 대상은 그룹 전체 또는 개별 하위 세션.
   * 하위 세션이 클릭된 경우, 부모 그룹을 함께 전달해서 모달에서 반복 스코프 다이얼로그를 표시할 수 있도록 한다.
   */
  onMore?: (target: AdminSession | AdminSessionGroup, parentGroup?: AdminSessionGroup) => void;
}

function SessionGroupRow({
  group,
  bordered = false,
  onManageAttendance,
  onMore,
}: SessionGroupRowProps) {
  // 반복 세션 그룹일 때만 토글과 하위 테이블을 노출
  const isRecurring = group.recurrenceType !== 'NONE';
  const [expanded, setExpanded] = useState(true);

  // 그룹 시작/종료일과 오늘을 비교해 SCHEDULED / OPEN / COMPLETED 도출
  const derivedGroupStatus = deriveSessionStatus(group.status, group.startDate, group.endDate);

  return (
    <div className={cn('flex flex-col', bordered && 'border-line border-t')}>
      {/* summary row */}
      <div className="flex h-12 w-full items-center">
        {/* sticky: 토글 + 세션 제목 */}
        <div
          className={cn(
            'bg-container-neutral sticky left-0 z-10 flex items-center',
            SESSION_TABLE_COLUMNS.titleSticky.widthClass,
          )}
        >
          <div className={cn('flex items-center pl-200', SESSION_TABLE_COLUMNS.toggle.widthClass)}>
            {isRecurring ? (
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

        <div
          className={cn(
            'flex items-center px-400 py-300 pr-600',
            SESSION_TABLE_COLUMNS.date.widthClass,
          )}
        >
          <span className="typo-body1 text-text-strong truncate">
            {isRecurring
              ? formatSessionDateRange(group.startDate, group.endDate)
              : formatSessionDate(group.startDate)}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center px-400 py-300 pr-600',
            SESSION_TABLE_COLUMNS.recurrence.widthClass,
          )}
        >
          {isRecurring && (
            <span className="typo-body1 text-text-strong truncate">
              {group.recurrenceDescription}
            </span>
          )}
        </div>
        <div
          className={cn(
            'flex items-center px-400 py-300 pr-600',
            SESSION_TABLE_COLUMNS.progress.widthClass,
          )}
        >
          <span className="typo-body1 text-text-strong">
            {group.completedCount}/{group.totalCount}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center px-400 py-300 pr-600',
            SESSION_TABLE_COLUMNS.status.widthClass,
          )}
        >
          <SessionStatusTag status={derivedGroupStatus} />
        </div>
        <div
          className={cn(
            'flex items-center px-400 py-300 pr-600',
            SESSION_TABLE_COLUMNS.attendance.widthClass,
          )}
        >
          {!isRecurring && group.sessions[0] && (
            <AttendanceLink
              status={derivedGroupStatus}
              onClick={() => onManageAttendance?.(group.sessions[0])}
            />
          )}
        </div>
        <div className="flex-1" />
        <div
          className={cn('flex items-center justify-center', SESSION_TABLE_COLUMNS.more.widthClass)}
        >
          <MoreButton onClick={() => onMore?.(group)} />
        </div>
      </div>

      {/* 하위 세션 펼침 영역 */}
      {isRecurring && (
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
              onMore={(session) => onMore?.(session, group)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { SessionGroupRow, type SessionGroupRowProps };
