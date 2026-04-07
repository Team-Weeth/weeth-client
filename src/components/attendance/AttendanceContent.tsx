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
import { useUserName } from '@/stores/useUserStore';
import type { AttendanceData } from '@/types/attendance';

interface AttendanceContentProps {
  attendance?: AttendanceData;
  errorMessage?: string;
  isAdmin?: boolean;
}

function AttendanceContent({ attendance, errorMessage, isAdmin = false }: AttendanceContentProps) {
  const name = useUserName() ?? '';
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
        {title ? (
          <AttendanceTodayCard
            overline="오늘의 출석"
            title={title}
            description={description}
            start={start ?? ''}
            endTime={end ?? ''}
            location={location ?? ''}
            sessionId={sessionId}
            isAdmin={isAdmin}
            isChecked={isChecked}
            onAttendanceComplete={handleAttendanceComplete}
          />
        ) : (
          <Card
            variant="onlyText"
            overline="오늘의 출석"
            title="오늘은 출석 일정이 없어요"
            showArrow={false}
          />
        )}

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
