import { AttendanceHistoryContent } from '@/components/attendance';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceSummary } from '@/types/attendance';

export default async function AttendanceHistoryPage() {
  // TODO: 하드코딩된 clubId 추후 동적으로 변경
  let summary: AttendanceSummary | undefined;

  try {
    const response = await attendanceServerApi.getDetail('YUNJcjFKMO');
    summary = response.data;
  } catch {
    // 에러 시 빈 상태로 렌더링
  }

  return (
    <AttendanceHistoryContent
      summary={
        summary ?? { attendanceCount: null, total: null, absenceCount: null, attendances: [] }
      }
    />
  );
}
