import { cn } from '@/lib/cn';
import type { FeedbackBotMessageCopy } from '@/types/feedback';

interface FeedbackChatBotMessageProps extends FeedbackBotMessageCopy {
  className?: string;
}

function FeedbackChatBotMessage({ title, content, className }: FeedbackChatBotMessageProps) {
  return (
    <div className={cn('text-text-normal flex flex-col gap-200 self-start', className)}>
      {title && <p className="typo-sub3 text-text-strong">{title}</p>}
      <p className="typo-body1 break-words break-keep whitespace-pre-line">{content}</p>
    </div>
  );
}

export { FeedbackChatBotMessage, type FeedbackChatBotMessageProps };
