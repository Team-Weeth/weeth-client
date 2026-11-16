import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { createFeedbackChatReplyMessage } from '@/utils/feedback/chatMessage';
import type {
  FeedbackChatMessage,
  FeedbackChatMessageStatus,
  FeedbackChatUserMessage,
} from '@/types/feedback';

// 패널을 닫았다 열거나 (main) 안에서 이동해도 대화를 유지하되, 새로고침하면 초기화되도록 persist 없이 메모리에만 둔다.
const initialState = {
  conversations: {} as Record<string, FeedbackChatMessage[]>,
};

export type FeedbackChatState = typeof initialState;

const EMPTY_MESSAGES: FeedbackChatMessage[] = [];

export const useFeedbackChatStore = create(
  devtools(
    combine(initialState, (set) => ({
      addUserMessage: (clubId: string, message: FeedbackChatUserMessage) =>
        set(
          (state) => ({
            conversations: {
              ...state.conversations,
              [clubId]: [...(state.conversations[clubId] ?? []), message],
            },
          }),
          false,
          'addUserMessage',
        ),
      setMessageStatus: (clubId: string, messageId: string, status: FeedbackChatMessageStatus) =>
        set(
          (state) => ({
            conversations: {
              ...state.conversations,
              [clubId]: (state.conversations[clubId] ?? []).map((message) =>
                message.id === messageId && message.role === 'user'
                  ? { ...message, status }
                  : message,
              ),
            },
          }),
          false,
          'setMessageStatus',
        ),
      addReply: (clubId: string, repliedMessageId: string) =>
        set(
          (state) => {
            const messages = state.conversations[clubId] ?? [];
            // 답장을 기다리는 사이 로그아웃 등으로 대화가 비워졌다면 원래 메시지 없이 답장만 남지 않게 한다.
            if (!messages.some((message) => message.id === repliedMessageId)) return state;
            const replyCount = messages.filter((message) => message.role === 'reply').length;
            return {
              conversations: {
                ...state.conversations,
                [clubId]: [...messages, createFeedbackChatReplyMessage(replyCount)],
              },
            };
          },
          false,
          'addReply',
        ),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'FeedbackChatStore' },
  ),
);

export const useFeedbackChatMessages = (clubId: string) =>
  useFeedbackChatStore((store) => store.conversations[clubId] ?? EMPTY_MESSAGES);
export const useFeedbackChatActions = () =>
  useFeedbackChatStore(
    useShallow((store) => ({
      addUserMessage: store.addUserMessage,
      setMessageStatus: store.setMessageStatus,
      addReply: store.addReply,
      reset: store.reset,
    })),
  );
