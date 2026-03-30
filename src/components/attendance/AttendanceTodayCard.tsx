'use client';

import Image from 'next/image';
<<<<<<< HEAD
=======
import { useRouter } from 'next/navigation';
>>>>>>> 55270ca518462724f147c59353b2be6794ced138
import { useState } from 'react';

import { CompleteIcon } from '@/assets/icons';
import { Card } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';
import { AttendanceCompleteModal } from '@/components/attendance/AttendanceCompleteModal';
<<<<<<< HEAD
=======
import { toastError } from '@/stores/useToastStore';
>>>>>>> 55270ca518462724f147c59353b2be6794ced138

interface AttendanceTodayCardProps {
  overline: string;
  title: string;
  description: string;
  start: string;
  endTime: string;
  location: string;
  isAdmin?: boolean;
  isChecked?: boolean;
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
  isAdmin = false,
  isChecked = false,
  onAttendanceComplete,
}: AttendanceTodayCardProps) {
<<<<<<< HEAD
=======
  const router = useRouter();
>>>>>>> 55270ca518462724f147c59353b2be6794ced138
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
<<<<<<< HEAD
        // TODO: 관리자 출석코드 확인 기능 별도 브랜치에서 구현 예정
        onSecondaryClick={isAdmin ? () => {} : undefined}
=======
        onSecondaryClick={
          isAdmin
            ? () => router.push('/attendance/qr')
            : () => toastError('관리자만 사용할 수 있는 기능입니다.')
        }
>>>>>>> 55270ca518462724f147c59353b2be6794ced138
        secondaryButtonText="출석코드 확인"
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
