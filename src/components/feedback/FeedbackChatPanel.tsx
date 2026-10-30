'use client';

import type { ReactNode } from 'react';
import DeleteIcon from '@/assets/icons/delete.svg';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { FEEDBACK_CHAT_SHEET_SNAP_POINT } from '@/constants/feedback';
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
        snapPoints={[FEEDBACK_CHAT_SHEET_SNAP_POINT]}
        defaultActiveSnapPoint={FEEDBACK_CHAT_SHEET_SNAP_POINT}
        header={
          <p aria-hidden className="typo-sub1 text-text-strong text-center">
            {title}
          </p>
        }
        footer={footer && <FeedbackChatPanelFooter>{footer}</FeedbackChatPanelFooter>}
        className={cn('rounded-t-lg', className)}
        bodyClassName="flex flex-col p-400"
        footerClassName="pt-0"
      >
        {/* 바텀시트 배경(container-neutral)이 말풍선 기본색과 같아 말풍선이 이 표식으로 색을 바꾼다. */}
        <div data-surface="sheet" className="group/feedback-surface flex flex-1 flex-col">
          {children}
        </div>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-transparent"
        className={cn(
          'bg-background top-auto right-[18px] bottom-[78px] left-auto flex h-[min(583px,calc(100dvh-120px))] w-[410px] max-w-[calc(100%-36px)] translate-x-0 translate-y-0 flex-col gap-0 rounded-lg border-0 p-0 shadow-lg',
          className,
        )}
      >
        <div className="flex shrink-0 items-start gap-400 p-400">
          <div className="flex min-w-0 flex-1 flex-col gap-200">
            <p className="typo-caption1 text-text-alternative">Weeth</p>
            <DialogTitle className="typo-sub1 text-text-strong">{title}</DialogTitle>
          </div>
          <DialogClose
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm"
            aria-label="닫기"
          >
            <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
          </DialogClose>
        </div>
        <div className="scrollbar-custom flex min-h-0 flex-1 flex-col overflow-y-auto p-400">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 px-400 pb-400">
            <FeedbackChatPanelFooter>{footer}</FeedbackChatPanelFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** 입력 영역 위 구분선. 데스크톱 모달과 모바일 바텀시트가 같은 모양을 쓴다. */
function FeedbackChatPanelFooter({ children }: { children: ReactNode }) {
  return <div className="border-line border-t pt-200">{children}</div>;
}

export { FeedbackChatPanel, type FeedbackChatPanelProps };
