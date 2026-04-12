import { cookies } from 'next/headers';

import { AttendanceHistoryContent } from '@/components/attendance';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceSummary } from '@/types/attendance';

export default async function AttendanceHistoryPage() {
  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;

  let summary: AttendanceSummary | undefined;
  let errorMessage: string | undefined;

  if (!clubId) {
    errorMessage = '동아리 정보를 찾을 수 없습니다.';
  } else {
    try {
      const response = await attendanceServerApi.getDetail(clubId);
      summary = response.data;
    } catch {
      errorMessage = '출석 기록을 불러오지 못했습니다.';
    }
  }

  return <AttendanceHistoryContent summary={summary} errorMessage={errorMessage} />;
}
