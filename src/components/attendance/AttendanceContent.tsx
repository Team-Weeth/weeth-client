'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { AttendanceCompleteModal } from '@/components/attendance/AttendanceCompleteModal';
import { AttendanceStatus } from '@/components/attendance/AttendanceStatus';
import { AttendanceTodayCard } from '@/components/attendance/AttendanceTodayCard';
import { formatAttendanceDescription } from '@/lib/formatTime';
import { useAttendanceQuery, useCheckIn } from '@/hooks/attendance';
import { useQRCheckIn } from '@/hooks/useQRCheckIn';
import { useIsAdmin } from '@/hooks/shared';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';
import { useUserName } from '@/stores/useUserStore';
import type { AttendanceData } from '@/types/attendance';

const CardinalMissingModal = dynamic(() =>
  import('@/components/home/CardinalMissingModal').then((m) => m.CardinalMissingModal),
);

interface AttendanceContentProps {
  attendance?: AttendanceData;
  errorMessage?: string;
  qrSessionId?: string;
  qrCode?: string;
}

function AttendanceContent({
  attendance,
  errorMessage,
  qrSessionId,
  qrCode,
}: AttendanceContentProps) {
  const name = useUserName() ?? '';
  const clubId = useClubId();
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: attendanceData } = useAttendanceQuery();
  const { clubId: clubIdParam } = useParams<{ clubId: string }>();
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const {
    isChecked: isCheckInChecked,
    cardinalModalOpen,
    setCardinalModalOpen,
    handleCheckIn: handleAttendanceComplete,
  } = useCheckIn({
    sessionId: attendance?.sessionId,
    onSuccess: () => setCompleteModalOpen(true),
  });

  const { isChecked: isQRChecked } = useQRCheckIn({
    qrSessionId,
    qrCode,
    onSuccess: () => {
      setCompleteModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ['attendance', clubId] });
    },
  });

  const isChecked = attendance?.status === 'ATTEND' || isCheckInChecked || isQRChecked;

  useEffect(() => {
    if (errorMessage) toastError(errorMessage);
  }, [errorMessage]);

  const {
    sessionId = null,
    title = null,
    start = null,
    end = null,
    location = null,
  } = attendance ?? {};
  const attendanceRate = attendanceData?.attendanceRate ?? attendance?.attendanceRate ?? 0;
  const description = formatAttendanceDescription(start ?? '', end ?? '', location);

  return (
    <>
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
            onClick={() => router.push(`/${clubIdParam}/attendance/history`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/${clubIdParam}/attendance/history`);
              }
            }}
          />
        </div>
      </div>

      <AttendanceCompleteModal
        open={completeModalOpen}
        onOpenChange={setCompleteModalOpen}
        title="출석이 완료되었어요!"
      />

      <CardinalMissingModal
        open={cardinalModalOpen}
        onClose={() => setCardinalModalOpen(false)}
        description="출석을 위해 기수 정보가 필요합니다."
      />
    </>
  );
}

export { AttendanceContent, type AttendanceContentProps };
