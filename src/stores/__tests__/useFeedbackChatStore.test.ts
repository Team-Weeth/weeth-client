import { useFeedbackChatStore } from '@/stores/useFeedbackChatStore';
import type { FeedbackChatUserMessage } from '@/types/feedback';

const CLUB_ID = 'test-club-id';

const userMessage: FeedbackChatUserMessage = {
  id: 'message-1',
  role: 'user',
  content: '알림이 늦게 와요',
  status: 'sent',
};

beforeEach(() => {
  useFeedbackChatStore.getState().reset();
});

describe('addReply', () => {
  it('답장할 메시지가 대화에 있으면 그 뒤에 감사 답장을 붙인다', () => {
    useFeedbackChatStore.getState().addUserMessage(CLUB_ID, userMessage);

    useFeedbackChatStore.getState().addReply(CLUB_ID, userMessage.id);

    expect(useFeedbackChatStore.getState().conversations[CLUB_ID]).toEqual([
      userMessage,
      expect.objectContaining({ role: 'reply' }),
    ]);
  });

  it('답장을 기다리는 사이 대화가 비워졌으면 답장을 붙이지 않는다', () => {
    useFeedbackChatStore.getState().addUserMessage(CLUB_ID, userMessage);
    useFeedbackChatStore.getState().reset();

    useFeedbackChatStore.getState().addReply(CLUB_ID, userMessage.id);

    expect(useFeedbackChatStore.getState().conversations[CLUB_ID]).toBeUndefined();
  });
});
