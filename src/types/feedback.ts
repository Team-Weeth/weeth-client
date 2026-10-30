/** 피드백이 접수된 진입 경로 — CHAT: FAB 채팅(A안), FORM: 설정 > 폼 페이지(B안) */
export type FeedbackChannel = 'CHAT' | 'FORM';

/**
 * 서비스 피드백 생성 요청 본문.
 * 이미지 첨부는 추후 선택 필드(예: `files?`)로 추가해도 기존 호출부가 깨지지 않도록 객체 형태를 유지한다.
 */
export interface CreateFeedbackRequest {
  content: string;
  channel: FeedbackChannel;
}
