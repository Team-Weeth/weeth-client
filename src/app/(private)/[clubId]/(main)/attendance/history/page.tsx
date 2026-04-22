import { AttendanceHistoryContent } from '@/components/attendance';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceSummary } from '@/types/attendance';

interface AttendanceHistoryPageProps {
  params: Promise<{ clubId: string }>;
}

export default async function AttendanceHistoryPage({ params }: AttendanceHistoryPageProps) {
  const { clubId } = await params;

  let summary: AttendanceSummary | undefined;
  let errorMessage: string | undefined;

  try {
    const response = await attendanceServerApi.getDetail(clubId);
    summary = response.data;
  } catch {
    errorMessage = '출석 기록을 불러오지 못했습니다.';
  }

  return <AttendanceHistoryContent summary={summary} errorMessage={errorMessage} />;
}
