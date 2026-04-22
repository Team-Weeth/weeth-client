'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { CompleteIcon } from '@/assets/icons';
import { Card } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';
import { toastError } from '@/stores/useToastStore';

interface AttendanceTodayCardProps {
  overline: string;
  title: string;
  description: string;
  start: string;
  endTime: string;
  location: string;
  sessionId?: number | null;
  isAdmin?: boolean;
  isChecked?: boolean;
  disabled?: boolean;
  onAttendanceComplete?: (code: string) => void;
}

function AttendanceCompleteBanner() {
  return (
    <div className="bg-background flex items-start gap-[10px] rounded-md p-300">
      <Image src={CompleteIcon} alt="출석 완료" width={40} height={40} />
      <div className="flex min-h-px min-w-px flex-1 flex-col gap-100">
        <p className="typo-sub3 text-text-normal">출석이 완료되었어요!</p>
        <p className="typo-body2 text-text-alternative">오늘도 즐거운 활동을 이어가세요.</p>
      </div>
    </div>
  );
}

function AttendanceTodayCard({
  overline,
  title,
  description,
  start,
  endTime,
  location,
  sessionId,
  isAdmin = false,
  isChecked = false,
  disabled = false,
  onAttendanceComplete,
}: AttendanceTodayCardProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  function handleSecondaryClick() {
    if (!isAdmin) {
      toastError('관리자만 사용할 수 있는 기능입니다.');
      return;
    }
    if (sessionId == null) return;
    router.push(`/${clubId}/attendance/qr?sessionId=${sessionId}`);
  }

  return (
    <>
      <Card
        variant="buttonSet"
        overline={overline}
        title={title}
        description={description}
        showArrow={false}
        onPrimaryClick={() => setCodeModalOpen(true)}
        primaryButtonText={isChecked ? '출석 완료' : '출석하기'}
        primaryButtonDisabled={disabled || isChecked}
        onSecondaryClick={handleSecondaryClick}
        secondaryButtonText="출석코드 확인"
        secondaryButtonDisabled={disabled || sessionId == null}
      >
        {isChecked && <AttendanceCompleteBanner />}
      </Card>

      <AttendanceCodeModal
        open={codeModalOpen}
        onOpenChange={setCodeModalOpen}
        onConfirm={(code) => onAttendanceComplete?.(code)}
        title={title}
        start={start}
        endTime={endTime}
        location={location}
      />
    </>
  );
}

export { AttendanceTodayCard, type AttendanceTodayCardProps };
