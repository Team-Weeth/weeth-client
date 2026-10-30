'use client';

import { useEffect, useRef } from 'react';
import ResetIcon from '@/assets/icons/reset.svg';
import { FeedbackChatBotMessage } from '@/components/feedback/FeedbackChatBotMessage';
import { Icon } from '@/components/ui/Icon';
import { FEEDBACK_CHAT_GREETING } from '@/constants/feedback';
import { cn } from '@/lib/cn';
import type { FeedbackChatMessage, FeedbackChatUserMessage } from '@/types/feedback';

interface FeedbackChatMessageListProps {
  messages: FeedbackChatMessage[];
  onRetry: (messageId: string) => void;
  className?: string;
}

function FeedbackChatMessageList({ messages, onRetry, className }: FeedbackChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length]);

  return (
    <div
      role="log"
      aria-label="서비스 피드백 대화"
      className={cn('flex flex-col gap-600', className)}
    >
      <FeedbackChatBotMessage
        title={FEEDBACK_CHAT_GREETING.title}
        content={FEEDBACK_CHAT_GREETING.content}
      />
      {messages.map((message) =>
        message.role === 'user' ? (
          <FeedbackChatUserBubble key={message.id} message={message} onRetry={onRetry} />
        ) : (
          <FeedbackChatBotMessage key={message.id} content={message.content} />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}

interface FeedbackChatUserBubbleProps {
  message: FeedbackChatUserMessage;
  onRetry: (messageId: string) => void;
}

function FeedbackChatUserBubble({ message, onRetry }: FeedbackChatUserBubbleProps) {
  const isFailed = message.status === 'failed';

  return (
    <div className="flex max-w-[85%] flex-col items-end gap-100 self-end">
      <p
        className={cn(
          // 데스크톱 모달(배경 background) 위에서는 흰 말풍선, 흰 바텀시트 위에서는 한 단계 진한 말풍선을 쓴다.
          'typo-body1 text-text-strong bg-container-neutral group-data-[surface=sheet]/feedback-surface:bg-container-neutral-alternative rounded-lg px-300 py-200 break-words break-keep whitespace-pre-wrap',
          message.status === 'sending' && 'opacity-60',
        )}
      >
        {message.content}
      </p>
      {message.status === 'sending' && (
        <span className="typo-caption2 text-text-alternative">전송 중</span>
      )}
      {isFailed && (
        <div className="flex items-center gap-200">
          <span className="typo-caption2 text-state-error">전송 실패</span>
          <button
            type="button"
            onClick={() => onRetry(message.id)}
            className="typo-caption1 text-text-alternative flex cursor-pointer items-center gap-100"
          >
            <Icon src={ResetIcon} size={14} className="text-icon-alternative" />
            다시 보내기
          </button>
        </div>
      )}
    </div>
  );
}

export { FeedbackChatMessageList, type FeedbackChatMessageListProps };
