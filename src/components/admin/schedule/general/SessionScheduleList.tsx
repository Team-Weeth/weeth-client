'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { SessionStatusTag } from '@/components/admin/schedule/session/SessionStatusTag';
import EditIcon from '@/assets/icons/edit.svg';
import ToggleOpenIcon from '@/assets/icons/admin/ic_admin_toggle_open.svg';
import SubdirectoryArrowRightIcon from '@/assets/icons/admin/ic_subdirectory_arrow_right.svg';
import SmArrowRightIcon from '@/assets/icons/admin/ic_admin_sm_arrow_right.svg';
import { deriveChildSessionStatus, deriveSessionStatus } from '@/utils/admin/sessionUtils';
import type { AdminSessionGroup, AdminSession } from '@/types/admin/session';

// --- Utilities ---

function formatShortDate(dateStr: string): string {
  return dateStr.slice(2).replace(/-/g, '.');
}

function formatGroupDateRange(start: string, end: string | null): string {
  const shortStart = formatShortDate(start);
  if (!end) return shortStart;
  const [, m, d] = end.split('-');
  return `${shortStart} ~ ${m}.${d}`;
}

function extractTime(isoStr: string): string {
  return isoStr.slice(11, 16);
}

function formatTimeRange(start: string, end: string): string {
  return `${extractTime(start)} - ${extractTime(end)}`;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function formatSessionDate(isoStr: string): string {
  const datePart = isoStr.slice(0, 10);
  const short = formatShortDate(datePart);
  const day = DAY_LABELS[new Date(`${datePart}T12:00:00`).getDay()];
  return `${short} (${day})`;
}

function isRepeating(group: AdminSessionGroup): boolean {
  return group.recurrenceType !== null && group.recurrenceType !== 'NONE';
}

// --- ProgressBar ---

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

// --- Child session row ---

function SessionChildRow({
  session,
  isLast,
  onEdit,
}: {
  session: AdminSession;
  isLast: boolean;
  onEdit?: (session: AdminSession) => void;
}) {
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

// --- Group row ---

function SessionGroupRow({
  group,
  expanded,
  onToggle,
  onEdit,
}: {
  group: AdminSessionGroup;
  expanded: boolean;
  onToggle: () => void;
  onEdit?: (group: AdminSessionGroup) => void;
}) {
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
          <div className="flex flex-col gap-[2px]">
            <span className="typo-body1 text-text-strong">단일</span>
            {firstSession && (
              <span className="typo-body1 text-text-normal">
                {formatTimeRange(firstSession.start, firstSession.end)}
              </span>
            )}
          </div>
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
        {showProgress && <ProgressBar completed={group.completedCount} total={group.totalCount} />}
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
        )}
      </div>

      {/* 수정 */}
      <div className={cn('flex w-[70px] shrink-0 items-center justify-center self-stretch', cellH)}>
        <button type="button" onClick={() => onEdit?.(group)}>
          <Icon src={EditIcon} size={20} className="text-icon-alternative" />
        </button>
      </div>
    </div>
  );
}

// --- SessionScheduleList ---

interface SessionScheduleListProps {
  sessions: AdminSessionGroup[];
  searchValue?: string;
  className?: string;
  onEditGroup?: (group: AdminSessionGroup) => void;
  onEditSession?: (session: AdminSession) => void;
}

function SessionScheduleList({
  sessions,
  searchValue = '',
  className,
  onEditGroup,
  onEditSession,
}: SessionScheduleListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number | null>>(
    () => new Set(sessions.filter(isRepeating).map((g) => g.groupId)),
  );

  const query = searchValue.trim().toLowerCase();
  const filtered = query ? sessions.filter((g) => g.title.toLowerCase().includes(query)) : sessions;

  const toggle = (groupId: number | null) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <div
      className={cn(
        'border-line bg-container-neutral flex flex-col overflow-clip rounded-sm border',
        className,
      )}
    >
      <div
        className={cn('overflow-x-auto', filtered.length > 0 && 'min-h-0 flex-1 overflow-y-auto')}
      >
        {/* Table header */}
        <div className="bg-container-neutral-alternative border-line sticky top-0 z-10 flex items-center border-b">
          <div className="typo-sub3 text-text-alternative max-w-[240px] min-w-[200px] flex-1 px-600 py-[15px]">
            세션 제목
          </div>
          <div className="typo-sub3 text-text-alternative max-w-[170px] min-w-[150px] flex-1 py-[15px] pr-600 pl-400">
            날짜
          </div>
          <div className="typo-sub3 text-text-alternative min-w-[140px] flex-1 py-[15px] pr-600 pl-400">
            반복 · 시간
          </div>
          <div className="typo-sub3 text-text-alternative max-w-[220px] min-w-[204px] flex-1 py-[15px] pr-600 pl-400">
            진행
          </div>
          <div className="typo-sub3 text-text-alternative w-[110px] shrink-0 py-[15px] pr-600 pl-400">
            상태
          </div>
          <div className="typo-sub3 text-text-alternative max-w-[200px] min-w-[160px] flex-1 py-[15px] pr-600 pl-400">
            출석 관리
          </div>
          <div className="w-[70px] shrink-0" />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex h-[188px] items-center justify-center">
            <p className="typo-sub1 text-text-alternative text-center">아직 등록된 세션이 없어요</p>
          </div>
        ) : (
          filtered.map((group, groupIndex) => {
            const expanded = expandedGroups.has(group.groupId);
            return (
              <div
                key={group.groupId ?? group.sessions[0]?.id ?? groupIndex}
                className={cn('border-line', groupIndex > 0 && 'border-t')}
              >
                <SessionGroupRow
                  group={group}
                  expanded={expanded}
                  onToggle={() => toggle(group.groupId)}
                  onEdit={onEditGroup}
                />
                {isRepeating(group) && group.sessions.length > 1 && (
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-200 ease-in-out',
                      expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="overflow-hidden">
                      {group.sessions.map((session, idx) => (
                        <SessionChildRow
                          key={session.id}
                          session={session}
                          isLast={idx === group.sessions.length - 1}
                          onEdit={onEditSession}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { SessionScheduleList, type SessionScheduleListProps };
