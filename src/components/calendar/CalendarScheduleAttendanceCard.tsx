'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { buttonVariants } from '@/components/ui/Button';
import { formatAttendanceTime } from '@/utils/shared/date';
import TimeIcon from '@/assets/icons/time.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import CheckIcon from '@/assets/icons/check.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import ScreenIcon from '@/assets/icons/admin/ic_admin_screen.svg';
import type { AttendanceStatus } from '@/types/calendar';

interface CalendarScheduleAttendanceCardProps {
  attendanceStatus: AttendanceStatus;
  dDayLabel: string | null;
  attendanceCompletedAt?: string;
  clubId: string | null;
}

function CalendarScheduleAttendanceCard({
  attendanceStatus,
  dDayLabel,
  attendanceCompletedAt,
  clubId,
}: CalendarScheduleAttendanceCardProps) {
  return (
    <div className="bg-container-neutral flex flex-col gap-200 rounded-md px-400 pt-200 pb-400">
      {attendanceStatus === 'completed' ? (
        <div className="flex items-center gap-300 self-stretch py-[13px]">
          <div className="bg-state-success/10 flex size-[40px] shrink-0 items-center justify-center rounded-md">
            <Icon src={CheckIcon} size={24} className="text-state-success" />
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className="typo-sub3 text-text-strong">출석 완료</span>
            {attendanceCompletedAt && (
              <span className="typo-caption2 text-text-alternative">
                {formatAttendanceTime(attendanceCompletedAt)}
              </span>
            )}
          </div>
        </div>
      ) : attendanceStatus === 'absent' ? (
        <div className="flex items-center gap-300 self-stretch py-[13px]">
          <div className="bg-state-error/10 flex size-[40px] shrink-0 items-center justify-center rounded-md">
            <Icon src={DeleteIcon} size={24} className="text-state-error" />
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className="typo-sub3 text-text-strong">결석</span>
            <span className="typo-caption2 text-text-alternative">
              해당 일정의 출석 기록을 확인할 수 있어요
            </span>
          </div>
        </div>
      ) : attendanceStatus === 'available' ? (
        <div className="flex items-center gap-300 self-stretch py-[13px]">
          <div className="bg-state-caution/10 flex size-[40px] shrink-0 items-center justify-center rounded-md">
            <Icon src={ScreenIcon} size={24} className="text-state-caution" />
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className="typo-sub3 text-text-strong">출석 체크 가능</span>
            <span className="typo-caption2 text-text-alternative">지금 출석 체크가 가능해요</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-300 self-stretch py-[13px]">
          <div className="bg-text-alternative/10 flex size-[40px] shrink-0 items-center justify-center rounded-md">
            <Icon src={TimeIcon} size={24} className="text-icon-alternative" />
          </div>
          <div className="flex flex-col gap-[3px]">
            <div className="flex items-center gap-100">
              <span className="typo-sub3 text-text-strong">출석 체크 예정</span>
              {dDayLabel && <Tag variant="end">{dDayLabel}</Tag>}
            </div>
            <span className="typo-caption2 text-text-alternative">
              일정 시작 시 출석 코드를 입력해 주세요
            </span>
          </div>
        </div>
      )}

      {clubId != null && (
        <div className="flex flex-col items-start gap-[10px] self-stretch">
          <Link
            href={`/${clubId}/attendance`}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'sm' }),
              'gap-100 pr-300 pl-400',
            )}
          >
            {attendanceStatus === 'completed' || attendanceStatus === 'absent'
              ? '출석 내역 보기'
              : '출석 페이지로 이동'}
            <Icon src={ArrowRightIcon} size={16} className="text-text-inverse" />
          </Link>
        </div>
      )}
    </div>
  );
}

export { CalendarScheduleAttendanceCard, type CalendarScheduleAttendanceCardProps };
