'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CompleteIcon } from '@/assets/icons';
import { Card } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';
import { AttendanceCompleteModal } from '@/components/attendance/AttendanceCompleteModal';
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
        <p className="typo-sub2 text-text-normal">출석이 완료되었어요!</p>
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
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  function handleCodeConfirm(code: string) {
    onAttendanceComplete?.(code);
    setCompleteModalOpen(true);
  }

  return (
    <>
      <Card
        variant="buttonSet"
        overline={overline}
        title={title}
        description={description}
        showArrow={false}
        onPrimaryClick={isChecked ? () => setCompleteModalOpen(true) : () => setCodeModalOpen(true)}
        primaryButtonText={isChecked ? '출석 완료' : '출석하기'}
        primaryButtonDisabled={disabled}
        onSecondaryClick={
          isAdmin
            ? () => router.push(`/attendance/qr?sessionId=${sessionId}`)
            : () => toastError('관리자만 사용할 수 있는 기능입니다.')
        }
        secondaryButtonText="출석코드 확인"
        secondaryButtonDisabled={disabled}
      >
        {isChecked && <AttendanceCompleteBanner />}
      </Card>

      <AttendanceCodeModal
        open={codeModalOpen}
        onOpenChange={setCodeModalOpen}
        onConfirm={handleCodeConfirm}
        title={title}
        start={start}
        endTime={endTime}
        location={location}
      />

      <AttendanceCompleteModal open={completeModalOpen} onOpenChange={setCompleteModalOpen} />
    </>
  );
}

export { AttendanceTodayCard, type AttendanceTodayCardProps };
