import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AttendanceQRContent } from '@/components/attendance';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { homeServerApi } from '@/lib/apis/home.server';

interface AttendanceQRPageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function AttendanceQRPage({ searchParams }: AttendanceQRPageProps) {
  const { sessionId: rawSessionId } = await searchParams;
  const sessionId = Number(rawSessionId);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    redirect('/attendance');
  }

  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;
  if (!clubId) redirect('/attendance');

  const { data } = await homeServerApi.getDashboard(clubId);
  const role = data.myInfo.userInfo.role;

  if (role !== 'LEAD' && role !== 'ADMIN') {
    redirect('/attendance');
  }

  return <AttendanceQRContent sessionId={sessionId} />;
}
