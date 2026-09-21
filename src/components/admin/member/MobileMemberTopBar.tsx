'use client';

import { useState } from 'react';

import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { BottomSheet, BottomSheetActionItem } from '@/components/ui/bottom-sheet/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ChangeCardinalsModal } from '@/components/admin/member/modal/ChangeCardinalsModal';
import { useSelectionBarTransition } from '@/components/admin/member/hooks/useSelectionBarTransition';
import { cn } from '@/lib/cn';
import {
  getChangeCardinalsOverline,
  getTopBarActions,
  isMemberStateAction,
} from '@/constants/admin/memberTopBar.constants';

import type { MemberTopBarProps } from '@/components/admin/member/MemberTopBar';
import type { TopBarAction } from '@/constants/admin/memberTopBar.constants';

function MobileMemberTopBar({
  className,
  style,
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
  ...props
}: MemberTopBarProps) {
  const [pendingAction, setPendingAction] = useState<TopBarAction | null>(null);
  const [isCardinalsOpen, setIsCardinalsOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const {
    isVisible,
    shouldRender,
    isAnimatedVisible,
    effectiveSelectedCount,
    layoutStyle,
    contentStyle,
  } = useSelectionBarTransition(selectedCount);

  const topBarActions = getTopBarActions({
    selectedCount: effectiveSelectedCount,
    targetRole,
    targetBanAction,
    onApprove,
    onChangeRole,
    onBan,
    onRestore,
    onTransferLead,
  });
  // 유저 추방/복구는 목록 맨 아래에 따로 배치한다.
  const memberStateAction = topBarActions.find(isMemberStateAction);
  const mainActions = topBarActions.filter((action) => action !== memberStateAction);

  // 선택이 풀리면 열려 있던 액션 시트 상태도 렌더 중에 닫아둔다.
  const [wasVisible, setWasVisible] = useState(isVisible);
  if (wasVisible !== isVisible) {
    setWasVisible(isVisible);
    if (!isVisible) setIsActionSheetOpen(false);
  }

  const handleClearSelection = () => {
    setIsActionSheetOpen(false);
    onBack();
  };

  const openActionDialog = (action: TopBarAction) => {
    if (action.disabled) return;
    setIsActionSheetOpen(false);
    setPendingAction(action);
  };

  if (!shouldRender) return null;

  return (
    <>
      <div
        className="tablet:hidden grid overflow-hidden will-change-[grid-template-rows]"
        style={layoutStyle}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            aria-hidden={!isAnimatedVisible}
            inert={!isAnimatedVisible}
            className={cn(
              'bg-container-floating flex items-center justify-between px-450 py-300 will-change-[transform,opacity]',
              isAnimatedVisible ? 'pointer-events-auto' : 'pointer-events-none',
              className,
            )}
            style={{ ...contentStyle, ...style }}
            {...props}
          >
            <SelectionCountLabel count={effectiveSelectedCount} className="pr-300" />

            <div className="flex min-w-0 items-center gap-300">
              <button
                type="button"
                onClick={handleClearSelection}
                className="flex shrink-0 cursor-pointer items-center gap-100 p-200"
                aria-label="선택 해제"
              >
                <Icon src={AdminCloseIcon} size={16} className="text-icon-disabled" alt="" />
                <span className="typo-caption2 text-text-disabled">해제</span>
              </button>

              <button
                type="button"
                className="bg-container-neutral text-text-strong typo-caption1 shrink-0 cursor-pointer rounded-sm px-300 py-200"
                onClick={() => setIsActionSheetOpen(true)}
              >
                작업 선택
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomSheet
        open={isActionSheetOpen}
        onOpenChange={setIsActionSheetOpen}
        title="멤버 작업 선택"
        expandable={false}
        headerClassName="px-500 pt-[3px] pb-100"
        header={
          <div className="flex items-center justify-between">
            <SelectionCountLabel count={effectiveSelectedCount} />
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              className="text-text-alternative px-0"
              onClick={handleClearSelection}
            >
              선택 해제
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-100">
          {mainActions.map((action) => (
            <BottomSheetActionItem
              key={action.id}
              disabled={action.disabled}
              onClick={() => openActionDialog(action)}
            >
              {action.label}
            </BottomSheetActionItem>
          ))}

          {onChangePosition && (
            <BottomSheetActionItem
              onClick={() => {
                setIsActionSheetOpen(false);
                onChangePosition();
              }}
            >
              포지션 변경
            </BottomSheetActionItem>
          )}

          {onChangeCardinals && (
            <BottomSheetActionItem
              onClick={() => {
                setIsActionSheetOpen(false);
                setIsCardinalsOpen(true);
              }}
            >
              기수 변경
            </BottomSheetActionItem>
          )}

          {memberStateAction && (
            <BottomSheetActionItem
              disabled={memberStateAction.disabled}
              destructive={memberStateAction.id === 'ban'}
              onClick={() => openActionDialog(memberStateAction)}
            >
              {memberStateAction.label}
            </BottomSheetActionItem>
          )}
        </div>
      </BottomSheet>

      {onChangeCardinals && (
        <ChangeCardinalsModal
          open={isCardinalsOpen}
          onOpenChange={setIsCardinalsOpen}
          overline={getChangeCardinalsOverline(effectiveSelectedCount, selectedMemberName)}
          memberCount={effectiveSelectedCount}
          memberCardinals={selectedMemberCardinals}
          onSubmit={onChangeCardinals}
        />
      )}

      {pendingAction && (
        <AlertDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingAction(null);
          }}
          status={pendingAction.id === 'ban' ? 'danger' : 'default'}
          title={pendingAction.title}
          description={pendingAction.description}
        >
          <AlertDialogAction
            onClick={() => {
              pendingAction.handler?.();
              setPendingAction(null);
            }}
          >
            {pendingAction.id === 'ban' ? '추방' : '확인'}
          </AlertDialogAction>
          <AlertDialogCancel>취소</AlertDialogCancel>
        </AlertDialog>
      )}
    </>
  );
}

function SelectionCountLabel({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn('flex shrink-0 items-center gap-200', className)}>
      <span className="bg-button-primary text-text-inverse typo-caption1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px]">
        {count}
      </span>
      <span className="typo-button2 text-text-alternative shrink-0">명 선택됨</span>
    </div>
  );
}

export { MobileMemberTopBar };
