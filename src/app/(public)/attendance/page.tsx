import { AttendanceProgressBar } from '@/components/attendance/AttendanceProgressBar';

export default function AttendancePage() {
  return (
    <div>
      <AttendanceProgressBar attendanceRate={80} />
    </div>
  );
}
