import { AttendanceContent } from '@/components/attendance';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceData } from '@/types/attendance';

export default async function AttendancePage() {
  // TODO: 하드코딩된 clubId 추후 동적으로 변경
  let attendance: AttendanceData | undefined;
  let errorMessage: string | undefined;

  try {
    const response = await attendanceServerApi.getAttendance('YUNJcjFKMO');
    attendance = response.data;
  } catch {
    errorMessage = '출석 정보를 불러오지 못했습니다.';
  }

  return <AttendanceContent attendance={attendance} errorMessage={errorMessage} />;
}
