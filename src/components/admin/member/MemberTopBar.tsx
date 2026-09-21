'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/Button';
import { ChangeCardinalsModal } from '@/components/admin/member/modal/ChangeCardinalsModal';
import { FloatingSelectionBar } from '@/components/admin/FloatingSelectionBar';
import { cn } from '@/lib/cn';
import {
  getChangeCardinalsOverline,
  getTopBarActions,
  isMemberStateAction,
} from '@/constants/admin/memberTopBar.constants';

import type { ClubMemberRole } from '@/types/admin/member';
import type { TopBarAction } from '@/constants/admin/memberTopBar.constants';

/** 플로팅 바 위에 올라가는 액션 버튼 공통 스타일 */
const TOP_BAR_BUTTON_CLASS =
  'typo-button2 bg-static-on-floating text-container-floating hover:bg-static-on-floating/90 shrink-0 rounded-sm px-300 py-200 whitespace-nowrap';

interface MemberTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCount: number;
  targetRole: ClubMemberRole | null;
  targetBanAction: 'ban' | 'restore' | null;
  onBack: () => void;
  onApprove?: () => void;
  onChangeRole?: () => void;
  onChangePosition?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onChangeCardinals?: (cardinalIds: number[], cardinalNumbers: number[]) => void;
  selectedMemberName?: string;
  selectedMemberCardinals?: number[][];
  onTransferLead?: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

function MemberTopBar({
  className,
  selectedCount,
  targetRole,
  targetBanAction,
  onBack,
  onApprove,
  onChangeRole,
  onChangePosition,
  onBan,
  onRestore,
  onChangeCardinals,
  selectedMemberName,
  selectedMemberCardinals = [],
  onTransferLead,
  ref,
  ...props
}: MemberTopBarProps) {
  const topBarActions = getTopBarActions({
    selectedCount,
    targetRole,
    targetBanAction,
    onApprove,
    onChangeRole,
    onBan,
    onRestore,
    onTransferLead,
  });

  const actionNodes = topBarActions.map((action) => (
    <TopBarActionDialog key={action.id} action={action} />
  ));

  if (onChangePosition) {
    // 포지션 변경은 유저 추방/복구 앞에 두고, 해당 액션이 없으면 맨 뒤에 붙인다.
    const memberStateIndex = topBarActions.findIndex(isMemberStateAction);
    const insertIndex = memberStateIndex === -1 ? actionNodes.length : memberStateIndex;
    actionNodes.splice(
      insertIndex,
      0,
      <Button
        key="changePosition"
        variant="secondary"
        size="md"
        onClick={onChangePosition}
        className={TOP_BAR_BUTTON_CLASS}
      >
        포지션 변경
      </Button>,
    );
  }

  return (
    <FloatingSelectionBar
      ref={ref}
      selectedCount={selectedCount}
      visible={selectedCount > 0}
      onClear={onBack}
      className={cn('max-tablet:hidden', className)}
      {...props}
    >
      {actionNodes}

      {onChangeCardinals && (
        <ChangeCardinalsModal
          overline={getChangeCardinalsOverline(selectedCount, selectedMemberName)}
          memberCount={selectedCount}
          memberCardinals={selectedMemberCardinals}
          onSubmit={onChangeCardinals}
        >
          <Button variant="secondary" size="md" className={TOP_BAR_BUTTON_CLASS}>
            기수 변경
          </Button>
        </ChangeCardinalsModal>
      )}
    </FloatingSelectionBar>
  );
}

function TopBarActionDialog({ action }: { action: TopBarAction }) {
  const { id, label, title, description, handler, disabled } = action;

  return (
    <AlertDialog
      status={id === 'ban' ? 'danger' : 'default'}
      title={title}
      description={description}
      trigger={
        <Button
          variant="secondary"
          size="md"
          className={cn(TOP_BAR_BUTTON_CLASS, id === 'ban' && 'text-state-error')}
          disabled={disabled}
        >
          {label}
        </Button>
      }
    >
      <AlertDialogAction onClick={handler}>{id === 'ban' ? '추방' : '확인'}</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { MemberTopBar, type MemberTopBarProps };
