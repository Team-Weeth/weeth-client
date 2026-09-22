export type MemberRoleFilterValue = 'ADMIN' | 'USER';

export const MEMBER_ROLE_FILTER_OPTIONS: { value: MemberRoleFilterValue; label: string }[] = [
  { value: 'ADMIN', label: '운영진' },
  { value: 'USER', label: '부원' },
];

function isMemberDetailPath(pathname: string, clubId: string) {
  return new RegExp(`^/${clubId}/member/[^/]+(/posts)?/?$`).test(pathname);
}

export { isMemberDetailPath };
