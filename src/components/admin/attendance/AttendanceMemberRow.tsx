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
      <div className="border-line flex min-w-0 flex-1 flex-col justify-center gap-200 border-r border-b border-l px-400 py-300">
        <span className="typo-sub2 text-text-strong">{member.name}</span>
        <div className="mt-100 flex items-center gap-200">
          <span className="typo-body2 text-text-normal">{member.department}</span>
          <span className="typo-body2 text-text-alternative">{member.studentId}</span>
        </div>
      </div>

      {/* 상태 영역 */}
      {isEditing ? (
        <>
          {/* 출석 */}
          <div className="border-line flex w-[79px] items-center justify-center border-r border-b">
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
          <div className="border-line flex w-[79px] items-center justify-center border-r border-b">
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
        <div className="border-line flex w-[158px] items-center justify-center gap-200 border-r border-b">
          <Icon
            src={ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].src}
            size={20}
            className={ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].className}
          />
          <span
            className={cn('typo-body1', ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].className)}
          >
            {ADMIN_ATTENDANCE_STATUS_CONFIG[member.status].label}
          </span>
        </div>
      )}
    </div>
  );
}

export { AttendanceMemberRow };
