import type { MemberDetail, MemberDetailStatus } from './MemberDetailModal';

export const STATUS_LABEL: Record<MemberDetailStatus, string> = {
  approved: '승인 완료',
  pending: '대기 중',
  banned: '추방',
};

export const STATUS_DOT_COLOR: Record<MemberDetailStatus, string> = {
  approved: 'bg-container-primary',
  pending: 'bg-state-caution',
  banned: 'bg-state-error',
};

export function getPersonalInfo(member: MemberDetail) {
  return [
    { label: '직급', value: member.position },
    { label: '역할', value: member.role },
    { label: '학과', value: member.department },
    { label: '전화번호', value: member.phone },
    { label: '학번', value: member.studentId },
    { label: '이메일', value: member.email },
  ];
}

export function getActivityInfo(member: MemberDetail) {
  return [
    { label: '활동기수', value: member.activeGenerations },
    { label: '상태', value: member.memberStatus },
    { label: '가입일', value: member.joinDate },
  ];
}

export function getActivityStats(member: MemberDetail) {
  return [
    { label: '출석', value: member.attendance, color: 'text-text-strong' },
    { label: '결석', value: member.absence, color: 'text-text-strong' },
    {
      label: '패널티',
      value: member.penalty,
      color: member.penalty > 0 ? 'text-state-error' : 'text-text-strong',
    },
  ];
}

interface FooterActionHandlers {
  onApprove?: () => void;
  onChangeToAdmin?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
}

export function getFooterActions({ onApprove, onChangeToAdmin, onResetPassword, onBan }: FooterActionHandlers) {
  return [
    { label: '가입 승인', title: '1명의 멤버 가입을 승인하시겠습니까?', handler: onApprove },
    {
      label: '관리자로 변경',
      title: '1명의 멤버 역할을 관리자로\n변경하시겠습니까?',
      handler: onChangeToAdmin,
    },
    {
      label: '비밀번호 초기화',
      title: '1명의 멤버 비밀번호를 초기화\n시키시겠습니까?',
      handler: onResetPassword,
    },
    { label: '유저 추방', title: '1명의 멤버를 추방하시겠습니까?', handler: onBan },
  ];
}
