'use client';

import { useState } from 'react';

import { CheckRoundIcon } from '@/assets/icons';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Icon,
} from '@/components/ui';
import { InputOTP } from '@/components/attendance/InputOTP';
import { useRemainingTime } from '@/hooks';
import { formatModalDescription } from '@/lib/formatTime';

interface AttendanceCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (code: string) => void;
  title: string;
  start: string;
  endTime: string;
  location: string;
}

function AttendanceCodeModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  start,
  endTime,
  location,
}: AttendanceCodeModalProps) {
  const [code, setCode] = useState('');
  const { minutes, seconds, isExpired } = useRemainingTime(endTime);
  const isComplete = code.length === 6;
  const description = formatModalDescription(start, location);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setCode('');
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background flex h-[565px] w-[508px] flex-col"
      >
        <DialogHeader
          icon={<Icon src={CheckRoundIcon} size={24} className="text-icon-alternative" />}
          overline="QR 출석하기"
          title={title}
          description={description}
          showClose
          onClose={() => handleOpenChange(false)}
        />

        <DialogBody className="flex-1 items-center justify-start gap-300 self-stretch p-400">
          <div className="bg-container-neutral-alternative flex items-start gap-[10px] self-stretch rounded-md p-300">
            <div className="flex flex-1 flex-col gap-100 text-center">
              <p className="typo-caption1 text-text-strong">
                운영진이 공유한 6자리 출석 코드를 입력하세요
              </p>
              <p className="typo-caption2 text-text-alternative">
                QR 스캔이 어려운 경우 코드를 직접 입력할 수 있어요
              </p>
            </div>
          </div>

          <InputOTP value={code} onChange={setCode} />

          {!isExpired ? (
            <p className="typo-caption2 text-text-strong text-center">
              출석 가능 시간{' '}
<<<<<<< HEAD
              <span className="text-brand-primary">
=======
              <span className="text-brand-primary tabular-nums">
>>>>>>> 55270ca518462724f147c59353b2be6794ced138
                {minutes}:{seconds}
              </span>
            </p>
          ) : (
            <p className="typo-caption2 text-state-error text-center">
              출석 가능 시간이 만료되었습니다
            </p>
          )}
        </DialogBody>

        <DialogFooter
          description="모바일에서는 QR코드를 카메라로 스캔할 수 있어요."
          showDivider
          className="self-stretch"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!isComplete || isExpired}
            onClick={() => {
              onConfirm?.(code);
              handleOpenChange(false);
            }}
          >
            출석 확인하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AttendanceCodeModal, type AttendanceCodeModalProps };
