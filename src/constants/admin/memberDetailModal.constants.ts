import type { ClubMemberRole, Member, MemberStatus } from '@/types/admin/member';

export function getPersonalInfo(member: Member) {
  return [
    { label: '역할', value: member.position },
    { label: '학과', value: member.department },
    { label: '전화번호', value: member.phone },
    { label: '학번', value: member.studentId },
    { label: '이메일', value: member.email },
  ];
}

export function getActivityStats(member: Member) {
  return [
    { label: '출석', value: member.attendance, color: 'text-text-strong' },
    { label: '결석', value: member.absence, color: 'text-text-strong' },
    // {
    //   label: '패널티',
    //   value: member.penaltyCount,
    //   color: member.penaltyCount > 0 ? 'text-state-error' : 'text-text-strong',
    // },
  ];
}

interface FooterActionHandlers {
  memberRole: ClubMemberRole;
  status: MemberStatus;
  onChangeRole?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onTransferLead?: () => void;
}

interface FooterAction {
  label: string;
  title: string;
  description?: string;
  handler?: () => void;
}

export function getFooterActions({
  memberRole,
  status,
  onChangeRole,
  onBan,
  onRestore,
  onTransferLead,
}: FooterActionHandlers): FooterAction[] {
  const isAdmin = memberRole === 'ADMIN';
  const isBanned = status === 'BANNED';
  const actions: FooterAction[] = [
    {
      label: isAdmin ? '사용자로 변경' : '운영진으로 변경',
      title: isAdmin
        ? '1명의 멤버 역할을 사용자로\n변경하시겠습니까?'
        : '1명의 멤버 역할을 운영진으로\n변경하시겠습니까?',
      handler: onChangeRole,
    },
    isBanned
      ? { label: '유저 복구', title: '1명의 멤버를 복구하시겠습니까?', handler: onRestore }
      : { label: '유저 추방', title: '1명의 멤버를 추방하시겠습니까?', handler: onBan },
  ];

  if (onTransferLead) {
    actions.push({
      label: '리더로 변경',
      title: '해당 멤버에게\n리더 권한을 이양하시겠습니까?',
      description: '리더는 동아리별로\n1명만 지정할 수 있습니다',
      handler: onTransferLead,
    });
  }

  return actions;
}

export type { FooterAction };
