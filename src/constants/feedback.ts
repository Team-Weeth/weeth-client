import type { FeedbackBotMessageCopy } from '@/types/feedback';

/** 서버 검증과 동일한 서비스 피드백 본문 최대 길이 (trim 이후 기준) */
export const FEEDBACK_CONTENT_MAX_LENGTH = 1000;

/**
 * A안 "서비스 안내" 메뉴에서 튜토리얼이 없는 역할(ADMIN 등)에게 보여줄 안내 메시지.
 * 디자인 확정 전 임시 문구이며, 내용이 정해지면 이 배열만 채우면 된다.
 */
export const FEEDBACK_SERVICE_GUIDE_MESSAGES: FeedbackBotMessageCopy[] = [
  { content: '서비스 안내를 준비하고 있어요.\n조금만 기다려 주세요!' },
];

// 모바일에서 화면 하단 전체 폭 고정 버튼(완료·삭제 등)이 있는 화면. FAB이 버튼을 가리므로 숨긴다.
const FEEDBACK_FAB_HIDDEN_MOBILE_ROUTES = [
  '/member/[^/]+',
  '/mypage/edit',
  '/mypage/profiles/add',
  '/mypage/profiles/[^/]+/edit',
  '/mypage/settings/theme',
] as const;

export function shouldHideFeedbackFabOnMobile(pathname: string, clubId: string) {
  return FEEDBACK_FAB_HIDDEN_MOBILE_ROUTES.some((route) =>
    new RegExp(`^/${clubId}${route}/?$`).test(pathname),
  );
}
