import { AttendanceContent } from '@/components/attendance';
import type { AttendanceData } from '@/types/attendance';

// TODO: API 연동 시 실제 데이터로 교체
function createMockAttendance(): AttendanceData {
  const now = new Date();
  const start = now;
  const end = new Date(now.getTime() + 10 * 60 * 1000); // 10분 후

  return {
    attendanceRate: 80,
    title: '1주차 정기모임',
    status: 'ATTEND',
    code: 123456,
    start: start.toISOString(),
    end: end.toISOString(),
    location: '공학관 401호',
  };
}

export default function AttendancePage() {
  // TODO: API 연동 시 실제 사용자 이름으로 교체
  const displayName = '사용자';
  return <AttendanceContent name={displayName} attendance={createMockAttendance()} />;
}
