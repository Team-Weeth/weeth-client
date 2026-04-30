import { redirect } from 'next/navigation';

import { AttendanceQRContent } from '@/components/attendance';
import { homeServerApi } from '@/lib/apis/home.server';

interface AttendanceQRPageProps {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function AttendanceQRPage({ params, searchParams }: AttendanceQRPageProps) {
  const { clubId } = await params;
  const { sessionId: rawSessionId } = await searchParams;
  const sessionId = Number(rawSessionId);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    redirect(`/${clubId}/attendance`);
  }

  const { data } = await homeServerApi.getDashboard(clubId);
  const role = data.myInfo.userInfo.role;

  if (role !== 'LEAD' && role !== 'ADMIN') {
    redirect(`/${clubId}/attendance`);
  }

  return <AttendanceQRContent sessionId={sessionId} />;
}
