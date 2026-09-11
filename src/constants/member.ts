import type { MemberPosition } from '@/types/member';

export const MEMBER_POSITION_OPTIONS: { value: MemberPosition; label: string }[] = [
  { value: '프론트엔드', label: '프론트엔드' },
  { value: '백엔드', label: '백엔드' },
  { value: '디자인', label: '디자인' },
  { value: '기획', label: '기획' },
];

export type MemberRoleFilterValue = 'ADMIN' | 'USER';

export const MEMBER_ROLE_FILTER_OPTIONS: { value: MemberRoleFilterValue; label: string }[] = [
  { value: 'ADMIN', label: '운영진' },
  { value: 'USER', label: '부원' },
];

function isMemberDetailPath(pathname: string, clubId: string) {
  return new RegExp(`^/${clubId}/member/[^/]+(/posts)?/?$`).test(pathname);
}

export { isMemberDetailPath };
