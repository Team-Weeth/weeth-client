'use client';

import Image, { type StaticImageData } from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { CompleteIcon, RushIcon } from '@/assets/icons';
import { Card } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';
import { toastError } from '@/stores/useToastStore';

interface AttendanceTodayCardProps {
  overline: string;
  title: string;
  description: string;
  start: string;
  location: string;
  sessionId?: number | null;
  isAdmin?: boolean;
  isChecked?: boolean;
  disabled?: boolean;
  onAttendanceComplete?: (code: string) => void;
}

interface AttendanceBannerProps {
  icon: StaticImageData;
  alt: string;
  title: string;
  description: string;
}

function AttendanceBanner({ icon, alt, title, description }: AttendanceBannerProps) {
  return (
    <div className="bg-background flex items-start gap-[10px] rounded-md p-300">
      <Image src={icon} alt={alt} width={40} height={40} />
      <div className="flex min-h-px min-w-px flex-1 flex-col gap-100">
        <p className="typo-sub3 text-text-normal">{title}</p>
        <p className="typo-body2 text-text-alternative">{description}</p>
      </div>
    </div>
  );
}

function AttendanceTodayCard({
  overline,
  title,
  description,
  start,
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
        {isChecked ? (
          <AttendanceBanner
            icon={CompleteIcon}
            alt="출석 완료"
            title="출석이 완료되었어요!"
            description="오늘도 즐거운 활동을 이어가세요."
          />
        ) : (
          !disabled && (
            <AttendanceBanner
              icon={RushIcon}
              alt="출석 진행"
              title="출석을 진행해주세요!"
              description="운영진이 공유한 코드를 통해 출석을 진행하세요."
            />
          )
        )}
      </Card>

      <AttendanceCodeModal
        open={codeModalOpen}
        onOpenChange={setCodeModalOpen}
        onConfirm={(code) => onAttendanceComplete?.(code)}
        title={title}
        start={start}
        location={location}
      />
    </>
  );
}

export { AttendanceTodayCard, type AttendanceTodayCardProps };
