import type { ClubMemberRole } from '@/types/admin/member';

interface TopBarActionParams {
  selectedCount: number;
  targetRole: ClubMemberRole | null; // null = 혼합 선택
  onApprove?: () => void;
  onChangeRole?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
}

export function getTopBarActions({
  selectedCount,
  targetRole,
  onApprove,
  onChangeRole,
  onResetPassword,
  onBan,
}: TopBarActionParams) {
  const roleLabel = targetRole === 'ADMIN' ? '관리자로 변경' : '사용자로 변경';
  const roleTitle =
    targetRole === 'ADMIN'
      ? `${selectedCount}명의 멤버 역할을 관리자로\n변경하시겠습니까?`
      : `${selectedCount}명의 멤버 역할을 사용자로\n변경하시겠습니까?`;

  return [
    {
      label: '가입 승인',
      title: `${selectedCount}명의 멤버 가입을 승인하시겠습니까?`,
      handler: onApprove,
      disabled: !onApprove,
    },
    {
      label: roleLabel,
      title: roleTitle,
      handler: onChangeRole,
      disabled: !onChangeRole || targetRole === null,
    },
    {
      label: '비밀번호 초기화',
      title: `${selectedCount}명의 멤버 비밀번호를 초기화\n시키시겠습니까?`,
      handler: onResetPassword,
      disabled: !onResetPassword,
    },
    {
      label: '유저 추방',
      title: `${selectedCount}명의 멤버를 추방하시겠습니까?`,
      handler: onBan,
      disabled: !onBan,
    },
  ];
}
