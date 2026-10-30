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

/** 서비스 피드백 채팅의 첫 인사 메시지 */
export const FEEDBACK_CHAT_GREETING: FeedbackBotMessageCopy = {
  title: 'Weeth에 바라는 점이 있나요?',
  // "참고할게요"와 ":)" 사이는 줄바꿈 없는 공백(U+00A0) — 폭이 빠듯할 때 ":)"만 다음 줄로 떨어지지 않게 한다.
  content:
    '안녕하세요 👋\nWeeth를 사용하면서 아쉬웠던 점이나\n새롭게 필요한 기능이 있나요?\n편하게 남겨주시면 더 나은 Weeth를 만드는 데 참고할게요 :)',
};

/** 피드백 전송 성공마다 순서대로 돌려 쓰는 감사 답장. 첫 번째가 기본 문구다. */
export const FEEDBACK_CHAT_THANKS_MESSAGES = [
  '소중한 의견 감사합니다! 💚\n보내주신 의견은 꼼꼼히 살펴보고,\n더 나은 Weeth를 만드는 데 참고할게요.',
  '의견 남겨주셔서 감사해요! 💚\n하나하나 꼼꼼히 읽어보고,\nWeeth를 더 좋게 만드는 데 반영할게요.',
  '보내주셔서 고마워요! 💚\n남겨주신 이야기는 빠짐없이 살펴보고,\n더 편한 Weeth를 만드는 데 참고할게요.',
] as const;

export const FEEDBACK_CHAT_INPUT_PLACEHOLDER = '의견을 자유롭게 남겨주세요';

/** 모바일 채팅 바텀시트 높이 비율 — Figma(16016:30679)에서 812px 화면 중 743px를 차지한다. */
export const FEEDBACK_CHAT_SHEET_SNAP_POINT = 743 / 812;
