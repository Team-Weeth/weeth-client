'use client';

import { useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { ArrowDownIcon, ArrowRightIcon, MoreHorizIcon } from '@/assets/icons';
import { SessionStatusTag } from '@/components/admin/schedule/SessionStatusTag';
import {
  formatSessionDate,
  formatSessionDateRange,
  formatSessionDayLabel,
  formatSessionTimeRange,
} from '@/utils/admin/sessionUtils';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

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

  const summaryRow = (
    <div className="flex h-12 w-full items-center gap-200">
      <div className="flex min-w-0 flex-1 items-center px-400 py-300 pr-600">
        <span className="typo-body1 text-text-strong truncate">{group.title}</span>
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
        {!hasChildren && (
          <button
            type="button"
            onClick={() => onManageAttendance?.(group)}
            className="hover:bg-container-neutral-interaction text-text-alternative flex cursor-pointer items-center gap-100 rounded-sm py-200"
          >
            <span className="typo-button2">출석 관리</span>
            <Icon src={ArrowRightIcon} size={16} className="text-text-alternative" />
          </button>
        )}
      </div>
      <div className="flex w-[71px] items-center justify-center">
        <button
          type="button"
          onClick={() => onMore?.(group)}
          aria-label="더보기"
          className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-200"
        >
          <Image src={MoreHorizIcon} alt="" width={24} height={24} />
        </button>
      </div>
    </div>
  );

  // 단일 row (하위 세션 없음): 토글 숨김
  if (!hasChildren) {
    return (
      <div
        className={cn(
          'bg-container-neutral flex w-full items-center gap-200',
          bordered && 'border-line border-t',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-200">{summaryRow}</div>
      </div>
    );
  }

  // 그룹 row: 토글 + 펼침 영역
  return (
    <div className={cn('flex flex-col', bordered && 'border-line border-t')}>
      <div className="flex w-full items-start gap-200">
        <div className="flex h-12 items-center pl-200">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? '세션 접기' : '세션 펼치기'}
            aria-expanded={expanded}
            className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-200"
          >
            <Icon
              src={ArrowDownIcon}
              size={24}
              className={cn(
                'text-icon-normal transition-transform duration-200 ease-in',
                !expanded && '-rotate-90',
              )}
            />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start">
          {summaryRow}

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
        </div>
      </div>
    </div>
  );
}

interface SessionChildTableProps {
  sessions: AdminSession[];
  onManageAttendance?: (session: AdminSession) => void;
  onMore?: (session: AdminSession) => void;
}

function SessionChildTable({ sessions, onManageAttendance, onMore }: SessionChildTableProps) {
  return (
    <div className="border-line flex w-full flex-col border-t pt-300 pb-400">
      {/* 하위 테이블 헤더 */}
      <div className="flex h-10 w-full items-center gap-200">
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
        <div key={session.id} className="flex h-10 w-full items-center gap-200">
          <div className="flex items-center pl-200">
            <div className="flex size-10 items-center justify-center">
              <span className="typo-body1 text-text-alternative">{idx + 1}</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-200">
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
              <button
                type="button"
                onClick={() => onManageAttendance?.(session)}
                className="hover:bg-container-neutral-interaction text-text-alternative flex cursor-pointer items-center gap-100 rounded-sm py-200"
              >
                <span className="typo-button2">출석 관리</span>
                <Icon src={ArrowRightIcon} size={16} className="text-text-alternative" />
              </button>
            </div>
            <div className="flex w-[71px] items-center justify-center">
              <button
                type="button"
                onClick={() => onMore?.(session)}
                aria-label="더보기"
                className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-200"
              >
                <Image src={MoreHorizIcon} alt="" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { SessionGroupRow, type SessionGroupRowProps };
