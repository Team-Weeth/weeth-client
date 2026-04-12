import { cookies } from 'next/headers';

import { AttendanceHistoryContent } from '@/components/attendance';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceSummary } from '@/types/attendance';

export default async function AttendanceHistoryPage() {
  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;

  let summary: AttendanceSummary | undefined;

  if (clubId) {
    try {
      const response = await attendanceServerApi.getDetail(clubId);
      summary = response.data;
    } catch {
      // 에러 시 빈 상태로 렌더링
    }
  }

  return (
    <AttendanceHistoryContent
      summary={
        summary ?? { attendanceCount: null, total: null, absenceCount: null, attendances: [] }
      }
    />
  );
}
