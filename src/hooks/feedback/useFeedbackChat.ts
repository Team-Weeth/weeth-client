'use client';

import { useCreateFeedbackMutation } from '@/hooks/mutations/useCreateFeedbackMutation';
import { useFeedbackChatActions, useFeedbackChatMessages } from '@/stores/useFeedbackChatStore';
import {
  buildFeedbackChatRequest,
  createFeedbackChatUserMessage,
} from '@/utils/feedback/chatMessage';
import type { FeedbackChatUserMessage } from '@/types/feedback';

/** 동아리별 서비스 피드백 채팅 대화와 전송·재전송 동작을 제공한다. */
function useFeedbackChat(clubId: string) {
  const messages = useFeedbackChatMessages(clubId);
  const { addUserMessage, setMessageStatus, addReply } = useFeedbackChatActions();
  const { mutateAsync } = useCreateFeedbackMutation();

  // mutate의 호출별 콜백은 마지막 호출·마운트된 상태에서만 실행되므로,
  // 연속 전송이나 패널을 닫은 뒤 도착한 응답도 반영되도록 Promise 결과로 상태를 갱신한다.
  const deliver = (message: FeedbackChatUserMessage) => {
    setMessageStatus(clubId, message.id, 'sending');
    mutateAsync(buildFeedbackChatRequest(message)).then(
      () => {
        setMessageStatus(clubId, message.id, 'sent');
        addReply(clubId);
      },
      () => {
        setMessageStatus(clubId, message.id, 'failed');
      },
    );
  };

  const send = (content: string) => {
    if (!content.trim()) return false;
    const message = createFeedbackChatUserMessage(content);
    addUserMessage(clubId, message);
    deliver(message);
    return true;
  };

  const retry = (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);
    if (message?.role !== 'user' || message.status !== 'failed') return;
    deliver(message);
  };

  return { messages, send, retry };
}

export { useFeedbackChat };
