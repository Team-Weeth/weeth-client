import { AttendanceContent } from '@/components/attendance';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceData } from '@/types/attendance';

interface AttendancePageProps {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ sessionId?: string; code?: string }>;
}

export default async function AttendancePage({ params, searchParams }: AttendancePageProps) {
  const { clubId } = await params;
  const { sessionId: qrSessionId, code: qrCode } = await searchParams;

  let attendance: AttendanceData | undefined;
  let errorMessage: string | undefined;

  try {
    const response = await attendanceServerApi.getAttendance(clubId);
    attendance = response.data;
  } catch {
    errorMessage = '출석 정보를 불러오지 못했습니다.';
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
