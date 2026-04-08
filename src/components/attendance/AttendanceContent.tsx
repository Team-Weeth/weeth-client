'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, Card } from '@/components/ui';
import { AttendanceStatus } from '@/components/attendance/AttendanceStatus';
import { AttendanceTodayCard } from '@/components/attendance/AttendanceTodayCard';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { attendanceApi } from '@/lib/apis/attendance';
import { formatAttendanceDescription } from '@/lib/formatTime';
import { toastError } from '@/stores/useToastStore';
import { useUserName, useUserRole } from '@/stores/useUserStore';
import type { AttendanceData } from '@/types/attendance';

interface AttendanceContentProps {
  attendance?: AttendanceData;
  errorMessage?: string;
}

function AttendanceContent({ attendance, errorMessage }: AttendanceContentProps) {
  const name = useUserName() ?? '';
  const role = useUserRole();
  const isAdmin = role === 'LEAD' || role === 'ADMIN';
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (errorMessage) toastError(errorMessage);
  }, [errorMessage]);

  const {
    sessionId = null,
    attendanceRate = 0,
    title = null,
    start = null,
    end = null,
    location = null,
  } = attendance ?? {};
  const description = formatAttendanceDescription(start ?? '', end ?? '', location ?? '');

  async function handleAttendanceComplete(code: string) {
    if (!sessionId) return;

    try {
      // TODO: 하드코딩된 clubId 추후 동적으로 변경
      await attendanceApi.checkIn('YUNJcjFKMO', sessionId, Number(code));
      setIsChecked(true);
    } catch (error) {
      const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data?.code;
      toastError(errorCode ? ATTENDANCE_ERROR_MESSAGE[errorCode] : undefined);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 pt-600">
      <Breadcrumb className="px-450">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="typo-caption1 text-text-alternative">출석</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AttendanceStatus name={name} attendanceRate={attendanceRate} className="px-450" />

      <div className="flex flex-col gap-300 px-450">
        <AttendanceTodayCard
          overline="오늘의 출석"
          title={title ?? '오늘은 일정이 없어요'}
          description={title ? description : '동아리원과 스터디를 해보는 건 어때요?'}
          start={start ?? ''}
          endTime={end ?? ''}
          location={location ?? ''}
          sessionId={sessionId}
          isAdmin={isAdmin}
          isChecked={isChecked}
          disabled={!title}
          onAttendanceComplete={handleAttendanceComplete}
        />

        <Card
          variant="onlyText"
          overline="출석"
          title="출석 기록"
          onClick={() => router.push('/attendance/history')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push('/attendance/history');
            }
          }}
        />
      </div>
    </div>
  );
}

export { AttendanceContent, type AttendanceContentProps };
