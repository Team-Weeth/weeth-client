'use client';

import { FeedbackChatInput } from '@/components/feedback/FeedbackChatInput';
import { FeedbackChatMessageList } from '@/components/feedback/FeedbackChatMessageList';
import { FeedbackChatPanel } from '@/components/feedback/FeedbackChatPanel';
import { useFeedbackChat } from '@/hooks/feedback/useFeedbackChat';

interface FeedbackChatProps {
  clubId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A안 채팅형 서비스 피드백. 대화는 동아리별로 메모리에 보관돼 패널을 다시 열어도 이어진다. */
function FeedbackChat({ clubId, open, onOpenChange }: FeedbackChatProps) {
  const { messages, send, retry } = useFeedbackChat(clubId);

  return (
    <FeedbackChatPanel
      open={open}
      onOpenChange={onOpenChange}
      title="서비스 피드백"
      footer={<FeedbackChatInput onSend={send} />}
    >
      <FeedbackChatMessageList messages={messages} onRetry={retry} />
    </FeedbackChatPanel>
  );
}

export { FeedbackChat, type FeedbackChatProps };
