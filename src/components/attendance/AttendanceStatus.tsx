import { cn } from '@/lib/cn';
import { AttendanceProgressBar } from '@/components/attendance/AttendanceProgressBar';

interface AttendanceStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  attendanceRate: number;
}

function AttendanceStatus({ attendanceRate, className, ...props }: AttendanceStatusProps) {
  return (
    <div className={cn('flex flex-col gap-300', className)} {...props}>
      <h2 className="typo-h3 text-text-strong">
        김위드님의
        <br />
        출석률은 {attendanceRate}%
      </h2>
      <AttendanceProgressBar attendanceRate={attendanceRate} />
    </div>
  );
}

export { AttendanceStatus, type AttendanceStatusProps };
