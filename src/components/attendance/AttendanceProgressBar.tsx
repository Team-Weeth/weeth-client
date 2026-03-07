import { cn } from '@/lib/cn';

interface AttendanceProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 출석률 (0-100). 나머지는 자동으로 결석률로 계산됨 */
  attendanceRate: number;
}

export function AttendanceProgressBar({
  attendanceRate,
  className,
  ...props
}: AttendanceProgressBarProps) {
  // 값 범위 제한
  const safeAttendanceRate = Math.min(100, Math.max(0, attendanceRate));
  // 결석률 = 100 - 출석률
  const absenceRate = 100 - safeAttendanceRate;

  return (
    <div
      className={cn(
        'bg-container-neutral-interaction relative h-[15px] w-full overflow-hidden rounded-[4px]',
        className,
      )}
      {...props}
    >
      {/* 출석률 바 (그라데이션) */}
      <div
        className="absolute top-0 left-0 h-full transition-all duration-300"
        style={{
          width: `${safeAttendanceRate}%`,
          background:
            'linear-gradient(90deg, var(--container-primary) 0%, var(--button-primary-interaction) 100%)',
        }}
      />

      {/* 결석률 바  */}
      {absenceRate > 0 && (
        <div
          className="bg-state-error absolute top-0 h-full transition-all duration-300"
          style={{
            left: `${safeAttendanceRate}%`,
            width: `${absenceRate}%`,
          }}
        />
      )}
    </div>
  );
}
