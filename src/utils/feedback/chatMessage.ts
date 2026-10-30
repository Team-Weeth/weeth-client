import { FEEDBACK_CHAT_THANKS_MESSAGES } from '@/constants/feedback';
import type {
  CreateFeedbackRequest,
  FeedbackChatReplyMessage,
  FeedbackChatUserMessage,
} from '@/types/feedback';

let messageSequence = 0;

function createMessageId() {
  messageSequence += 1;
  return `feedback-chat-${Date.now()}-${messageSequence}`;
}

function createFeedbackChatUserMessage(content: string): FeedbackChatUserMessage {
  return { id: createMessageId(), role: 'user', content: content.trim(), status: 'sending' };
}

/** 이전 답장 수를 기준으로 감사 문구를 돌려 써서 매번 같은 답장이 반복되지 않게 한다. */
function createFeedbackChatReplyMessage(previousReplyCount: number): FeedbackChatReplyMessage {
  const content =
    FEEDBACK_CHAT_THANKS_MESSAGES[previousReplyCount % FEEDBACK_CHAT_THANKS_MESSAGES.length];
  return { id: createMessageId(), role: 'reply', content };
}

/** 채팅 메시지를 피드백 생성 요청으로 변환한다. 첨부 등 요청 필드가 늘어나면 여기서만 매핑한다. */
function buildFeedbackChatRequest(message: FeedbackChatUserMessage): CreateFeedbackRequest {
  return { content: message.content, channel: 'CHAT' };
}

export { buildFeedbackChatRequest, createFeedbackChatReplyMessage, createFeedbackChatUserMessage };
