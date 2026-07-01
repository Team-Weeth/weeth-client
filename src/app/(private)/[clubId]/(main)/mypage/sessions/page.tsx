import { MyPageSessionsContent } from '@/components/mypage/MyPageSessionsContent';
import { attendanceServerApi } from '@/lib/apis/attendance.server';
import type { AttendanceSummary } from '@/types/attendance';

interface MyPageSessionsPageProps {
  params: Promise<{ clubId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function MyPageSessionsPage({ params }: MyPageSessionsPageProps) {
  const { clubId } = await params;

  let summary: AttendanceSummary | undefined;
  let errorMessage: string | undefined;

  try {
    const response = await attendanceServerApi.getDetail(clubId);
    summary = response.data;
  } catch {
    errorMessage = '출석 기록을 불러오지 못했습니다.';
  }

  return <MyPageSessionsContent summary={summary} errorMessage={errorMessage} />;
}
