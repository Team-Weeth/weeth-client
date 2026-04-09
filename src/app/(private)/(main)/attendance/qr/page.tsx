import { redirect } from 'next/navigation';

import { AttendanceQRContent } from '@/components/attendance';
import { homeServerApi } from '@/lib/apis/home.server';

interface AttendanceQRPageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function AttendanceQRPage({ searchParams }: AttendanceQRPageProps) {
  const { sessionId } = await searchParams;

  if (!sessionId) {
    redirect('/attendance');
  }

  // TODO: 하드코딩된 clubId 추후 동적으로 변경
  const { data } = await homeServerApi.getDashboard('YUNJcjFKMO');
  const role = data.myInfo.userInfo.role;

  if (role !== 'LEAD' && role !== 'ADMIN') {
    redirect('/attendance');
  }

  return <AttendanceQRContent sessionId={Number(sessionId)} />;
}
