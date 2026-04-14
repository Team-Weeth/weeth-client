import { cookies } from 'next/headers';

import { AttendanceContent } from '@/components/attendance';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceData } from '@/types/attendance';

interface AttendancePageProps {
  searchParams: Promise<{ sessionId?: string; code?: string }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const { sessionId: qrSessionId, code: qrCode } = await searchParams;

  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;

  let attendance: AttendanceData | undefined;
  let errorMessage: string | undefined;

  if (!clubId) {
    errorMessage = '동아리 정보를 찾을 수 없습니다.';
  } else {
    try {
      const response = await attendanceServerApi.getAttendance(clubId);
      attendance = response.data;
    } catch {
      errorMessage = '출석 정보를 불러오지 못했습니다.';
    }
  }

  return (
    <AttendanceContent
      attendance={attendance}
      errorMessage={errorMessage}
      qrSessionId={qrSessionId}
      qrCode={qrCode}
    />
  );
}
