'use client';

import Image from 'next/image';

import DuesTutorialImage from '@/assets/image/dues_tutorial.png';
import { InfoCircleIcon } from '@/assets/icons';
import { Button } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';

interface DuesTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: () => void;
}

function DuesTutorialModal({ open, onOpenChange, onStart }: DuesTutorialModalProps) {
  const handleStart = () => {
    onOpenChange(false);
    onStart?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-[390px] flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        <div className="flex flex-col gap-300 p-400">
          <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative" alt="안내" />
          <div className="flex flex-col gap-200">
            <p className="typo-sub1 text-text-strong">기수의 총 회비 정보를 입력해주세요</p>
            <p className="typo-body2 text-text-alternative">
              총 회비 정보를 입력하고 회비 기록을 이어나가세요. 회비 정보는 비공개로 시작돼요.
            </p>
          </div>
        </div>

        <div className="px-600 pb-400">
          <Image
            src={DuesTutorialImage}
            alt="회비 관리 미리보기"
            className="w-full rounded-md"
            placeholder="blur"
          />
        </div>

        <div className="px-400 pb-400">
          <Button variant="primary" size="lg" className="w-full" onClick={handleStart}>
            총 회비 정보 입력 시작하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DuesTutorialModal, type DuesTutorialModalProps };
