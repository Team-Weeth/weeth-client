import type { Member } from '@/types/admin/member';

export function getBulkTargetRole(members: Member[]): 'ADMIN' | 'USER' | null {
  if (members.length === 0) return null;
  if (members.every((m) => m.memberRole === 'USER')) return 'ADMIN';
  if (members.every((m) => m.memberRole === 'ADMIN')) return 'USER';
  return null;
}

export function getBulkBanAction(members: Member[]): 'ban' | 'restore' | null {
  if (members.length === 0) return null;
  if (members.every((m) => m.status === 'BANNED')) return 'restore';
  if (members.every((m) => m.status !== 'BANNED')) return 'ban';
  return null;
}
