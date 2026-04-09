interface TopBarActionParams {
  selectedCount: number;
  canChangeToAdmin: boolean;
  canChangeToUser: boolean;
  onApprove?: () => void;
  onChangeToAdmin?: () => void;
  onChangeToUser?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
}

export function getTopBarActions({
  selectedCount,
  canChangeToAdmin,
  canChangeToUser,
  onApprove,
  onChangeToAdmin,
  onChangeToUser,
  onResetPassword,
  onBan,
}: TopBarActionParams) {
  return [
    {
      label: '가입 승인',
      title: `${selectedCount}명의 멤버 가입을 승인하시겠습니까?`,
      handler: onApprove,
      disabled: !onApprove,
    },
    {
      label: '관리자로 변경',
      title: `${selectedCount}명의 멤버 역할을 관리자로\n변경하시겠습니까?`,
      handler: onChangeToAdmin,
      disabled: !canChangeToAdmin,
    },
    {
      label: '사용자로 변경',
      title: `${selectedCount}명의 멤버 역할을 사용자로\n변경하시겠습니까?`,
      handler: onChangeToUser,
      disabled: !canChangeToUser,
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
