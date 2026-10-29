'use client';

import type { ReactNode } from 'react';
import DeleteIcon from '@/assets/icons/delete.svg';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

interface FeedbackChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * FAB에서 여는 채팅형 패널 껍데기.
 * 데스크톱은 FAB 위 우측 하단에 붙는 모달, 모바일(tablet 미만)은 바텀시트로 띄운다.
 */
function FeedbackChatPanel({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: FeedbackChatPanelProps) {
  const isMobile = useMediaQuery('(max-width: 695.98px)');

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        showCancelButton={false}
        header={
          <p aria-hidden className="typo-sub2 text-text-strong text-center">
            {title}
          </p>
        }
        footer={footer}
        className={className}
        bodyClassName="flex min-h-[50dvh] flex-col px-400"
        footerClassName="pt-200"
      >
        {children}
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-transparent"
        className={cn(
          'top-auto right-[18px] bottom-[78px] left-auto flex h-[min(583px,calc(100dvh-120px))] w-[410px] max-w-[calc(100%-36px)] translate-x-0 translate-y-0 flex-col gap-0 rounded-lg p-0',
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-300 px-500 pt-500 pb-300">
          <div className="flex flex-col gap-100">
            <p className="typo-caption2 text-text-alternative">Weeth</p>
            <DialogTitle className="typo-sub2 text-text-strong">{title}</DialogTitle>
          </div>
          <DialogClose className="cursor-pointer" aria-label="닫기">
            <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
          </DialogClose>
        </div>
        <div className="scrollbar-custom flex min-h-0 flex-1 flex-col overflow-y-auto px-500 py-300">
          {children}
        </div>
        {footer && <div className="shrink-0 px-500 pb-500">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}

export { FeedbackChatPanel, type FeedbackChatPanelProps };
