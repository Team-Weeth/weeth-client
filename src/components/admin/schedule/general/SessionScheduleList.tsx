'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { SessionChildRow } from '@/components/admin/schedule/general/SessionChildRow';
import { SessionGroupRow } from '@/components/admin/schedule/general/SessionGroupRow';
import { isRepeating } from '@/utils/admin/sessionScheduleListUtils';
import type { AdminSessionGroup, AdminSession } from '@/types/admin/session';

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
        <div className="bg-container-neutral-alternative border-line sticky top-0 z-10 flex min-w-fit items-center border-b">
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
                className={cn('border-line min-w-fit', groupIndex > 0 && 'border-t')}
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
                    <div className="min-w-fit overflow-hidden">
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
