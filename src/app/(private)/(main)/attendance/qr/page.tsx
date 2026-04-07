import { redirect } from 'next/navigation';

import { AttendanceQRContent } from '@/components/attendance';

interface AttendanceQRPageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function AttendanceQRPage({ searchParams }: AttendanceQRPageProps) {
  const { sessionId } = await searchParams;

  if (!sessionId) {
    redirect('/attendance');
  }

  return <AttendanceQRContent sessionId={Number(sessionId)} />;
}
