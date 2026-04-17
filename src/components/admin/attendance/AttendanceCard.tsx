'use client';

import { ArrowDownIcon, SearchIcon } from '@/assets/icons';
import { Button, Icon, Badge } from '@/components/ui';
import type { AttendanceMember } from '@/types/admin/attendance';
import { cn } from '@/lib/cn';

import { useAttendanceCard } from './useAttendanceCard';
import { AttendanceMemberRow } from './AttendanceMemberRow';
import { AttendanceTableRow } from './AttendanceTableRow';

interface AttendanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  date: string;
  title: string;
  isCurrentWeek?: boolean;
  members: AttendanceMember[];
  onSave?: (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) => void;
}

function AttendanceCard({
  className,
  date,
  title,
  isCurrentWeek,
  members,
  onSave,
  ...props
}: AttendanceCardProps) {
  const {
    isCollapsed,
    isEditing,
    searchQuery,
    setSearchQuery,
    filteredMembers,
    expand,
    collapse,
    startEdit,
    cancelEdit,
    saveEdit,
    toggleStatus,
    getEditStatus,
  } = useAttendanceCard({ members, onSave });

  if (isCollapsed) {
    return (
      <div className={cn('overflow-hidden rounded-md', className)} {...props}>
        <button
          type="button"
          className="border-line flex h-[72px] w-full cursor-pointer items-center justify-between rounded-md border px-600"
          onClick={expand}
        >
          <div className="flex items-center gap-300">
            <span className="typo-sub1 text-text-normal">{date}</span>
            <span className="typo-sub1 text-text-normal">{title}</span>
            {isCurrentWeek && <Badge>이번 주</Badge>}
          </div>
          <Icon src={ArrowDownIcon} size={24} className="text-icon-normal" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('bg-background overflow-hidden rounded-md', className)} {...props}>
      {/* Green header */}
      <button
        type="button"
        className="bg-container-primary flex h-[72px] w-full cursor-pointer items-center justify-between px-600"
        onClick={collapse}
      >
        <div className="flex items-center gap-300">
          <span className="typo-sub1 text-text-inverse">{date}</span>
          <span className="typo-sub1 text-text-inverse">{title}</span>
          {isCurrentWeek && (
            <span className="typo-caption1 rounded-[5px] bg-white/30 px-200 py-100 text-white">
              이번 주
            </span>
          )}
        </div>
        <span className="flex size-12 items-center justify-center">
          <Icon src={ArrowDownIcon} size={24} className="rotate-180 text-white" />
        </span>
      </button>

      {/* Body */}
      <div className="flex flex-col gap-600 p-450">
        {/* Search + Actions */}
        <div className="flex items-center justify-between">
          <div className="bg-container-neutral relative h-12 w-[492px] rounded-sm">
            <Icon
              src={SearchIcon}
              size={24}
              className="text-icon-alternative absolute top-1/2 left-400 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for name"
              autoComplete="off"
              className="typo-body1 placeholder:text-text-alternative h-full w-full bg-transparent py-300 pr-300 pl-14 focus:outline-none"
            />
          </div>
          {isEditing ? (
            <div className="flex gap-200">
              <Button variant="secondary" size="lg" onClick={cancelEdit}>
                취소
              </Button>
              <Button variant="primary" size="lg" onClick={saveEdit}>
                저장
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="lg" onClick={startEdit}>
              수정
            </Button>
          )}
        </div>

        {/* Attendance grid */}
        <div className="bg-container-neutral rounded-sm">
          {/* Header row */}
          <AttendanceTableRow isEditing={isEditing} position="top" />

          {/* Member rows */}
          {filteredMembers.map((member) => (
            <AttendanceMemberRow
              key={member.id}
              member={member}
              isEditing={isEditing}
              status={getEditStatus(member.id) ?? member.status}
              onToggle={toggleStatus}
            />
          ))}

          {/* Footer row */}
          <AttendanceTableRow isEditing={isEditing} position="bottom" />
        </div>
      </div>
    </div>
  );
}

export { AttendanceCard, type AttendanceCardProps };
