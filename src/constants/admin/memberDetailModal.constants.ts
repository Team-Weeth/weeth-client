import type { Member, MemberStatus } from '@/types/admin/member';

export const STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: 'ACTIVE',
  WAITING: 'WAITING',
  BANNED: 'BANNED',
  LEFT: 'LEFT',
};

export const STATUS_DOT_COLOR: Record<MemberStatus, string> = {
  ACTIVE: 'bg-container-primary',
  WAITING: 'bg-state-caution',
  BANNED: 'bg-state-error',
  LEFT: 'bg-container-neutral-alternative',
};

export function getPersonalInfo(member: Member) {
  return [
    { label: '직급', value: member.position },
    { label: '역할', value: member.role },
    { label: '학과', value: member.department },
    { label: '전화번호', value: member.phone },
    { label: '학번', value: member.studentId },
    { label: '이메일', value: member.email },
  ];
}

export function getActivityInfo(member: Member) {
  return [{ label: '활동기수', value: member.generation }];
}

export function getActivityStats(member: Member) {
  return [
    { label: '출석', value: member.attendance, color: 'text-text-strong' },
    { label: '결석', value: member.absence, color: 'text-text-strong' },
    {
      label: '패널티',
      value: member.penaltyCount,
      color: member.penaltyCount > 0 ? 'text-state-error' : 'text-text-strong',
    },
  ];
}

import type { ClubMemberRole } from '@/types/admin/member';

interface FooterActionHandlers {
  memberRole: ClubMemberRole;
  status: MemberStatus;
  onApprove?: () => void;
  onChangeRole?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
}

export function getFooterActions({
  memberRole,
  status,
  //  onApprove,
  onChangeRole,
  //  onResetPassword,
  onBan,
  onRestore,
}: FooterActionHandlers) {
  const isAdmin = memberRole === 'ADMIN';
  const isBanned = status === 'BANNED';
  return [
    // TODO: 가입 승인 api 열리면 열기
    // { label: '가입 승인', title: '1명의 멤버 가입을 승인하시겠습니까?', handler: onApprove },
    {
      label: isAdmin ? '사용자로 변경' : '관리자로 변경',
      title: isAdmin
        ? '1명의 멤버 역할을 사용자로\n변경하시겠습니까?'
        : '1명의 멤버 역할을 관리자로\n변경하시겠습니까?',
      handler: onChangeRole,
    },
    // TODO: 비번 변경 api 열리면 열기
    // {
    //   label: '비밀번호 초기화',
    //   title: '1명의 멤버 비밀번호를 초기화\n시키시겠습니까?',
    //   handler: onResetPassword,
    // },
    isBanned
      ? { label: '유저 복구', title: '1명의 멤버를 복구하시겠습니까?', handler: onRestore }
      : { label: '유저 추방', title: '1명의 멤버를 추방하시겠습니까?', handler: onBan },
  ];
}
