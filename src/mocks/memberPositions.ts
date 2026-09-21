import type { MemberPositionOption } from '@/types/admin/memberPosition';

// 포지션 API 연동 전 테이블 UI 확인용 데이터입니다.
export const MOCK_MEMBER_POSITIONS: readonly MemberPositionOption[] = [
  { id: 'planning', name: '기획', color: 'purple' },
  { id: 'design', name: '디자인', color: 'pink' },
  { id: 'frontend', name: '프론트엔드', color: 'secondary' },
  { id: 'backend', name: '백엔드', color: 'primary' },
];

export function getMockMemberPosition(memberId: string): string | null {
  const hash = Array.from(memberId).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return MOCK_MEMBER_POSITIONS[hash % 6]?.id ?? null;
}
