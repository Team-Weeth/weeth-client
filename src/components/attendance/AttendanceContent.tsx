'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, Card } from '@/components/ui';
import { AttendanceCompleteModal } from '@/components/attendance/AttendanceCompleteModal';
import { AttendanceStatus } from '@/components/attendance/AttendanceStatus';
import { AttendanceTodayCard } from '@/components/attendance/AttendanceTodayCard';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { attendanceApi } from '@/lib/apis/attendance';
import { formatAttendanceDescription } from '@/lib/formatTime';
import { useQRCheckIn } from '@/hooks/useQRCheckIn';
import { useProfileStatusQuery } from '@/hooks/home/useProfileStatusQuery';
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
  const { data: profileStatus } = useProfileStatusQuery();
  const [cardinalModalOpen, setCardinalModalOpen] = useState(false);
  const [isManualChecked, setIsManualChecked] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const { isChecked: isQRChecked } = useQRCheckIn({
    qrSessionId,
    qrCode,
    onSuccess: async () => {
      setCompleteModalOpen(true);
      if (clubId) {
        const response = await attendanceApi.getAttendance(clubId);
        setAttendanceRate(response.data.data.attendanceRate);
      }
    },
  });

  const isAlreadyChecked = attendance?.status === 'ATTEND';
  const isChecked = isAlreadyChecked || isManualChecked || isQRChecked;

  useEffect(() => {
    if (errorMessage) toastError(errorMessage);
  }, [errorMessage]);

  const {
    sessionId = null,
    attendanceRate: initialAttendanceRate = 0,
    title = null,
    start = null,
    end = null,
    location = null,
  } = attendance ?? {};
  const [attendanceRate, setAttendanceRate] = useState(initialAttendanceRate);
  const description = formatAttendanceDescription(start ?? '', end ?? '', location ?? '');

  async function handleAttendanceComplete(code: string) {
    if (!profileStatus?.cardinalAssigned) {
      setCardinalModalOpen(true);
      return;
    }
    if (!clubId || !sessionId) return;

    try {
      await attendanceApi.checkIn(clubId, sessionId, Number(code));
      setIsManualChecked(true);
      setCompleteModalOpen(true);

      const response = await attendanceApi.getAttendance(clubId);
      setAttendanceRate(response.data.data.attendanceRate);
    } catch (error) {
      const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data?.code;
      toastError(errorCode ? ATTENDANCE_ERROR_MESSAGE[errorCode] : undefined);
    }
  }

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
