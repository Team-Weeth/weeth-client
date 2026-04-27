'use client';

import Image from 'next/image';

import { TaskFinishedIcon } from '@/assets/icons';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/ui';

interface AttendanceCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

function AttendanceCompleteModal({
  open,
  onOpenChange,
  title = '이미 출석을 완료했네요!',
  description = '오늘도 즐거운 활동을 이어가세요.',
}: AttendanceCompleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background flex h-[565px] w-full max-w-[508px] min-w-[320px] flex-col"
      >
        <DialogHeader showClose onClose={() => onOpenChange(false)} />

        <DialogBody className="flex-1 items-center justify-center gap-300 p-400">
          <Image src={TaskFinishedIcon} alt="출석 완료" width={120} height={120} />
          <div className="flex flex-col gap-200 text-center">
            <h2 className="typo-sub2 text-text-strong">{title}</h2>
            <p className="typo-body2 text-text-alternative">{description}</p>
          </div>
        </DialogBody>

        <DialogFooter showDivider className="self-stretch">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AttendanceCompleteModal, type AttendanceCompleteModalProps };
