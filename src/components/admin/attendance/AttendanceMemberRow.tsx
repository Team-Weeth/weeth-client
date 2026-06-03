'use client';

import { AdminRadioSelectedIcon, AdminRadioUnselectedIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import type { AttendanceMember } from '@/types/admin/attendance';
import { ADMIN_ATTENDANCE_STATUS_CONFIG } from '@/constants/admin/attendance.admin';
import { AttendanceStatus } from '@/constants/attendance';
import { cn } from '@/lib/cn';

interface AttendanceMemberRowProps {
  member: AttendanceMember;
  isEditing: boolean;
  status: AttendanceStatus;
  onToggle: (id: number, status: 'ATTEND' | 'ABSENT') => void;
}

function AttendanceMemberRow({ member, isEditing, status, onToggle }: AttendanceMemberRowProps) {
  return (
    <div className="flex">
      {/* 사용자 정보 */}
      <div className="border-line tablet:px-400 flex min-w-0 flex-1 flex-col justify-center gap-200 border-r border-b border-l px-300 py-300">
        <span className="typo-sub3 text-text-strong break-all">{member.name}</span>
        <div className="mt-100 flex flex-wrap items-center gap-x-200 gap-y-100">
          <span className="typo-body2 text-text-normal break-all">{member.department}</span>
          <span className="typo-body2 text-text-alternative shrink-0">{member.studentId}</span>
        </div>
      </div>

      {/* 상태 영역 */}
      {isEditing ? (
        <>
          {/* 출석 */}
          <div className="border-line tablet:w-[79px] flex w-[56px] items-center justify-center border-r border-b">
            <button
              type="button"
              onClick={() => onToggle(member.id, 'ATTEND')}
              className="cursor-pointer"
              aria-label={`${member.name} 출석`}
            >
              <Icon
                src={status === 'ATTEND' ? AdminRadioSelectedIcon : AdminRadioUnselectedIcon}
                size={24}
                className={status === 'ATTEND' ? 'text-state-success' : 'text-icon-alternative'}
              />
            </button>
          </div>

          {/* 결석 */}
          <div className="border-line tablet:w-[79px] flex w-[56px] items-center justify-center border-r border-b">
            <button
              type="button"
              onClick={() => onToggle(member.id, 'ABSENT')}
              className="cursor-pointer"
              aria-label={`${member.name} 결석`}
            >
              <Icon
                src={status === 'ABSENT' ? AdminRadioSelectedIcon : AdminRadioUnselectedIcon}
                size={24}
                className={status === 'ABSENT' ? 'text-state-error' : 'text-icon-alternative'}
              />
            </button>
          </div>
        </>
      ) : (
        <div className="border-line tablet:w-[158px] tablet:flex-row tablet:gap-200 flex w-[112px] flex-col items-center justify-center gap-100 border-r border-b px-200">
          <Icon
            src={ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].src}
            size={20}
            className={ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].className}
          />
          <span
            className={cn(
              'typo-body2 tablet:typo-body1',
              ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].className,
            )}
          >
            {ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].label}
          </span>
        </div>
      )}
    </div>
  );
}

export { AttendanceMemberRow };
