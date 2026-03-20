import { AttendanceContent } from '@/components/attendance';
import type { AttendanceData } from '@/types/attendance';

// TODO: API 연동 시 실제 데이터로 교체
const mockAttendance: AttendanceData = {
  attendanceRate: 80,
  title: '1주차 정기모임',
  status: 'ATTEND',
  code: 1234,
  start: '2026-03-20T04:53:06.913Z',
  end: '2026-03-20T04:53:06.913Z',
  location: '공학관 401호',
};

export default function AttendancePage() {
  return <AttendanceContent attendance={mockAttendance} />;
}
