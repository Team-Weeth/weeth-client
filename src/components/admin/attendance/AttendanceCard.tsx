'use client';

import {
  AdminRadioSelectedIcon,
  AdminRadioUnselectedIcon,
  AdminRoundCancelIcon,
  AdminTimeIcon,
} from '@/assets/icons/admin';
import { ArrowDownIcon, CheckRoundIcon, SearchIcon } from '@/assets/icons';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

import { useAttendanceCard } from './useAttendanceCard';

interface AttendanceMember {
  id: number;
  name: string;
  department: string;
  major: string;
  studentId: string;
  status: 'PENDING' | 'PRESENT' | 'ABSENT';
}

interface AttendanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  date: string;
  title: string;
  isCurrentWeek?: boolean;
  members: AttendanceMember[];
  onSave?: (updates: { id: number; status: 'PRESENT' | 'ABSENT' }[]) => void;
}

const STATUS_CONFIG = {
  PENDING: { src: AdminTimeIcon, label: '미결', className: 'text-text-alternative' },
  PRESENT: { src: CheckRoundIcon, label: '출석', className: 'text-brand-primary' },
  ABSENT: { src: AdminRoundCancelIcon, label: '결석', className: 'text-state-error' },
} as const;

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
      <button
        type="button"
        className={cn(
          'border-line flex h-[72px] w-full cursor-pointer items-center justify-between rounded-md border px-600',
          className,
        )}
        onClick={expand}
        {...(props as React.HTMLAttributes<HTMLButtonElement>)}
      >
        <div className="flex items-center gap-300">
          <span className="typo-sub1 text-text-normal">{date}</span>
          <span className="typo-sub1 text-text-normal">{title}</span>
          {isCurrentWeek && (
            <span className="bg-brand-primary/10 text-brand-primary typo-caption1 rounded-[5px] px-200 py-100">
              이번 주
            </span>
          )}
        </div>
        <Icon src={ArrowDownIcon} size={24} className="text-icon-normal" />
      </button>
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
          <div className="flex">
            <div className="border-line flex min-w-0 flex-1 items-center rounded-tl-sm border px-400 py-300">
              <span className="typo-sub2 text-text-alternative">사용자 정보</span>
            </div>
            {isEditing ? (
              <>
                <div className="border-line flex w-[79px] items-center justify-center border px-400 py-300">
                  <span className="typo-sub2 text-text-alternative">출석</span>
                </div>
                <div className="border-line flex w-[79px] items-center justify-center rounded-tr-sm border px-400 py-300">
                  <span className="typo-sub2 text-text-alternative">결석</span>
                </div>
              </>
            ) : (
              <div className="border-line flex w-[158px] items-center justify-center rounded-tr-sm border px-400 py-300">
                <span className="typo-sub2 text-text-alternative">출석 정보</span>
              </div>
            )}
          </div>

          {/* Member rows */}
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex">
              <div className="border-line flex min-w-0 flex-1 flex-col justify-center border px-400 py-300">
                <span className="typo-sub2 text-text-strong">{member.name}</span>
                <div className="mt-100 flex items-center gap-200">
                  <span className="typo-body2 text-text-normal">{member.department}</span>
                  <span className="typo-body2 text-text-alternative">{member.major}</span>
                  <span className="typo-body2 text-text-alternative">{member.studentId}</span>
                </div>
              </div>
              {isEditing ? (
                <>
                  <div className="border-line flex w-[79px] items-center justify-center border">
                    <button
                      type="button"
                      onClick={() => toggleStatus(member.id, 'PRESENT')}
                      className="cursor-pointer"
                      aria-label={`${member.name} 출석`}
                    >
                      <Icon
                        src={
                          getEditStatus(member.id) === 'PRESENT'
                            ? AdminRadioSelectedIcon
                            : AdminRadioUnselectedIcon
                        }
                        size={24}
                        className={
                          getEditStatus(member.id) === 'PRESENT'
                            ? 'text-state-success'
                            : 'text-icon-alternative'
                        }
                      />
                    </button>
                  </div>
                  <div className="border-line flex w-[79px] items-center justify-center border">
                    <button
                      type="button"
                      onClick={() => toggleStatus(member.id, 'ABSENT')}
                      className="cursor-pointer"
                      aria-label={`${member.name} 결석`}
                    >
                      <Icon
                        src={
                          getEditStatus(member.id) === 'ABSENT'
                            ? AdminRadioSelectedIcon
                            : AdminRadioUnselectedIcon
                        }
                        size={24}
                        className={
                          getEditStatus(member.id) === 'ABSENT'
                            ? 'text-state-error'
                            : 'text-icon-alternative'
                        }
                      />
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-line flex w-[158px] items-center justify-center gap-200 border">
                  <Icon
                    src={STATUS_CONFIG[member.status].src}
                    size={20}
                    className={STATUS_CONFIG[member.status].className}
                  />
                  <span className={cn('typo-body1', STATUS_CONFIG[member.status].className)}>
                    {STATUS_CONFIG[member.status].label}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Footer row */}
          <div className="flex">
            <div className="border-line flex min-w-0 flex-1 items-center rounded-bl-sm border px-400 py-300">
              <span className="typo-sub2 text-text-alternative">사용자 정보</span>
            </div>
            {isEditing ? (
              <>
                <div className="border-line flex w-[79px] items-center justify-center border px-400 py-300">
                  <span className="typo-sub2 text-text-alternative">출석</span>
                </div>
                <div className="border-line flex w-[79px] items-center justify-center rounded-br-sm border px-400 py-300">
                  <span className="typo-sub2 text-text-alternative">결석</span>
                </div>
              </>
            ) : (
              <div className="border-line flex w-[158px] items-center justify-center rounded-br-sm border px-400 py-300">
                <span className="typo-sub2 text-text-alternative">출석 정보</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AttendanceCard, type AttendanceCardProps, type AttendanceMember };
