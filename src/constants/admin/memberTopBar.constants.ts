import type { ClubMemberRole } from '@/types/admin/member';

interface TopBarActionParams {
  selectedCount: number;
  targetRole: ClubMemberRole | null; // null = 혼합 선택
  targetBanAction: 'ban' | 'restore' | null; // null = BANNED와 BANNED 아닌 멤버가 섞임
  onApprove?: () => void;
  onChangeRole?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onTransferLead?: () => void;
}

interface TopBarAction {
  label: string;
  title: string;
  description?: string;
  handler?: () => void;
  disabled: boolean;
}

export function getTopBarActions({
  selectedCount,
  targetRole,
  targetBanAction,
  onApprove,
  onChangeRole,
  onBan,
  onRestore,
  onTransferLead,
}: TopBarActionParams): TopBarAction[] {
  const roleLabel = targetRole === 'ADMIN' ? '운영진으로 변경' : '사용자로 변경';
  const roleTitle =
    targetRole === 'ADMIN'
      ? `${selectedCount}명의 멤버 역할을 운영진으로\n변경하시겠습니까?`
      : `${selectedCount}명의 멤버 역할을 사용자로\n변경하시겠습니까?`;

  const actions: TopBarAction[] = [
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
    targetBanAction === 'restore'
      ? {
          label: '유저 복구',
          title: `${selectedCount}명의 멤버를 복구하시겠습니까?`,
          handler: onRestore,
          disabled: !onRestore,
        }
      : {
          label: '유저 추방',
          title: `${selectedCount}명의 멤버를 추방하시겠습니까?`,
          handler: onBan,
          disabled: !onBan || targetBanAction === null,
        },
  ];

  if (onTransferLead) {
    actions.push({
      label: '리더로 변경',
      title: '해당 멤버에게\n리더 권한을 이양하시겠습니까?',
      description: '리더는 동아리별로\n1명만 지정할 수 있습니다',
      handler: onTransferLead,
      disabled: false,
    });
  }

  return actions;
}

export type { TopBarAction };
