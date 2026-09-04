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

interface StatusRowProps {
  icon: React.ReactNode;
  bgColorClass: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}

function StatusRow({ icon, bgColorClass, title, subtitle }: StatusRowProps) {
  return (
    <div className="flex items-center gap-300 self-stretch py-[13px]">
      <div
        className={cn(
          'flex size-[40px] shrink-0 items-center justify-center rounded-md',
          bgColorClass,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-[3px]">
        <div className="typo-sub3 text-text-strong flex items-center gap-100">{title}</div>
        {subtitle && <span className="typo-caption2 text-text-alternative">{subtitle}</span>}
      </div>
    </div>
  );
}

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
        <StatusRow
          icon={<Icon src={CheckIcon} size={24} className="text-state-success" />}
          bgColorClass="bg-state-success/10"
          title="출석 완료"
          subtitle={attendanceCompletedAt ? formatAttendanceTime(attendanceCompletedAt) : undefined}
        />
      ) : attendanceStatus === 'absent' ? (
        <StatusRow
          icon={<Icon src={DeleteIcon} size={24} className="text-state-error" />}
          bgColorClass="bg-state-error/10"
          title="결석"
          subtitle="해당 일정의 출석 기록을 확인할 수 있어요"
        />
      ) : attendanceStatus === 'available' ? (
        <StatusRow
          icon={<Icon src={ScreenIcon} size={24} className="text-state-caution" />}
          bgColorClass="bg-state-caution/10"
          title="출석 체크 가능"
          subtitle="지금 출석 체크가 가능해요"
        />
      ) : (
        <StatusRow
          icon={<Icon src={TimeIcon} size={24} className="text-icon-alternative" />}
          bgColorClass="bg-text-alternative/10"
          title={
            <>
              출석 체크 예정
              {dDayLabel && <Tag variant="end">{dDayLabel}</Tag>}
            </>
          }
          subtitle="일정 시작 시 출석 코드를 입력해 주세요"
        />
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
