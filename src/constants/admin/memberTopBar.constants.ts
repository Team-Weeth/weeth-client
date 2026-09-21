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
  id: 'approve' | 'changeRole' | 'ban' | 'restore' | 'transferLead';
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
      id: 'approve',
      label: '가입 승인',
      title: `${selectedCount}명의 멤버 가입을 승인하시겠습니까?`,
      handler: onApprove,
      disabled: !onApprove,
    },
    {
      id: 'changeRole',
      label: roleLabel,
      title: roleTitle,
      handler: onChangeRole,
      disabled: !onChangeRole || targetRole === null,
    },
    targetBanAction === 'restore'
      ? {
          id: 'restore',
          label: '유저 복구',
          title: `${selectedCount}명의 멤버를 복구하시겠습니까?`,
          handler: onRestore,
          disabled: !onRestore,
        }
      : {
          id: 'ban',
          label: '유저 추방',
          title: '선택한 유저를 추방하시겠어요?',
          description: '신중히 확인 후 진행해 주세요.',
          handler: onBan,
          disabled: !onBan || targetBanAction === null,
        },
  ];

  if (onTransferLead) {
    actions.push({
      id: 'transferLead',
      label: '리더로 변경',
      title: '해당 멤버에게\n리더 권한을 이양하시겠습니까?',
      description: '리더는 동아리별로\n1명만 지정할 수 있습니다',
      handler: onTransferLead,
      disabled: false,
    });
  }

  return actions;
}

/** 유저 추방/복구처럼 멤버 상태를 바꾸는 액션. 다른 액션과 분리해 배치한다. */
export const isMemberStateAction = (action: { id: string }) =>
  action.id === 'ban' || action.id === 'restore';

/** 기수 변경 모달 상단 문구. 1명만 선택했으면 이름을 노출한다. */
export function getChangeCardinalsOverline(selectedCount: number, selectedMemberName?: string) {
  return selectedCount === 1 && selectedMemberName
    ? `'${selectedMemberName}'의 기수를 선택하세요`
    : `${selectedCount}명의 기수를 일괄 변경합니다.`;
}

export type { TopBarAction };
