'use client';

import React from 'react';

import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { BottomSheet, BottomSheetActionItem } from '@/components/ui/bottom-sheet/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ChangeCardinalsModal } from '@/components/admin/member/modal/ChangeCardinalsModal';
import { FloatingSelectionBar } from '@/components/admin/FloatingSelectionBar';
import { cn } from '@/lib/cn';
import { getTopBarActions } from '@/constants/admin/memberTopBar.constants';

import type { ClubMemberRole } from '@/types/admin/member';
import type { TopBarAction } from '@/constants/admin/memberTopBar.constants';

const MOBILE_SELECTION_BAR_ANIMATION_MS = 420;
const MOBILE_SELECTION_BAR_EXIT_OPACITY_MS = 560;
const MOBILE_SELECTION_BAR_ENTER_CONTENT_DELAY_MS = 60;
const MOBILE_SELECTION_BAR_EXIT_LAYOUT_DELAY_MS = 80;
const MOBILE_SELECTION_BAR_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

interface MemberTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCount: number;
  targetRole: ClubMemberRole | null;
  targetBanAction: 'ban' | 'restore' | null;
  onBack: () => void;
  onApprove?: () => void;
  onChangeRole?: () => void;
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
  onBan,
  onRestore,
  onChangeCardinals,
  selectedMemberName,
  selectedMemberCardinals = [],
  onTransferLead,
  ref,
  ...props
}: MemberTopBarProps) {
  const isVisible = selectedCount > 0;
  const changeCardinalsOverline =
    selectedCount === 1 && selectedMemberName
      ? `'${selectedMemberName}'의 기수를 선택하세요`
      : `${selectedCount}명의 기수를 일괄 변경합니다.`;

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

  return (
    <FloatingSelectionBar
      ref={ref}
      selectedCount={selectedCount}
      visible={isVisible}
      onClear={onBack}
      className={cn('max-tablet:hidden', className)}
      {...props}
    >
      {topBarActions.map(({ id, label, title, description, handler, disabled }) => (
        <AlertDialog
          key={id}
          title={title}
          description={description}
          trigger={
            <Button
              variant="secondary"
              size="md"
              className={cn(
                'typo-button2 bg-static-on-floating text-container-floating hover:bg-static-on-floating/90 shrink-0 rounded-sm px-300 py-200 whitespace-nowrap',
                id === 'ban' && 'text-state-error',
              )}
              disabled={disabled}
            >
              {label}
            </Button>
          }
        >
          <AlertDialogAction onClick={handler}>확인</AlertDialogAction>
          <AlertDialogCancel>취소</AlertDialogCancel>
        </AlertDialog>
      ))}

      {onChangeCardinals && (
        <ChangeCardinalsModal
          overline={changeCardinalsOverline}
          memberCount={selectedCount}
          memberCardinals={selectedMemberCardinals}
          onSubmit={onChangeCardinals}
        >
          <Button
            variant="secondary"
            size="md"
            className="typo-button2 bg-static-on-floating text-container-floating hover:bg-static-on-floating/90 shrink-0 rounded-sm px-300 py-200 whitespace-nowrap"
          >
            기수 변경
          </Button>
        </ChangeCardinalsModal>
      )}
    </FloatingSelectionBar>
  );
}

function MobileMemberTopBar({
  className,
  style,
  selectedCount,
  targetRole,
  targetBanAction,
  onBack,
  onApprove,
  onChangeRole,
  onBan,
  onRestore,
  onChangeCardinals,
  selectedMemberName,
  selectedMemberCardinals = [],
  onTransferLead,
  ...props
}: MemberTopBarProps) {
  const [pendingAction, setPendingAction] = React.useState<TopBarAction | null>(null);
  const [isCardinalsOpen, setIsCardinalsOpen] = React.useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);
  const isVisible = selectedCount > 0;
  const [shouldRender, setShouldRender] = React.useState(isVisible);
  const [isAnimatedVisible, setIsAnimatedVisible] = React.useState(false);
  const [displayedSelectedCount, setDisplayedSelectedCount] = React.useState(selectedCount);
  const effectiveSelectedCount = isVisible ? selectedCount : displayedSelectedCount;
  const changeCardinalsOverline =
    effectiveSelectedCount === 1 && selectedMemberName
      ? `'${selectedMemberName}'의 기수를 선택하세요`
      : `${effectiveSelectedCount}명의 기수를 일괄 변경합니다.`;

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
  const memberStateAction = topBarActions.find(
    (action) => action.id === 'ban' || action.id === 'restore',
  );
  const mainActions = topBarActions.filter((action) => action !== memberStateAction);

  const handleActionConfirm = () => {
    pendingAction?.handler?.();
    setPendingAction(null);
  };

  const handleClearSelection = () => {
    setIsActionSheetOpen(false);
    onBack();
  };

  React.useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setDisplayedSelectedCount(selectedCount);
      return;
    }

    setIsAnimatedVisible(false);
    setIsActionSheetOpen(false);
    const timeout = window.setTimeout(
      () => setShouldRender(false),
      MOBILE_SELECTION_BAR_EXIT_OPACITY_MS + MOBILE_SELECTION_BAR_EXIT_LAYOUT_DELAY_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [isVisible, selectedCount]);

  React.useEffect(() => {
    if (!shouldRender || !isVisible) return;

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsAnimatedVisible(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [isVisible, shouldRender]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className="tablet:hidden grid overflow-hidden will-change-[grid-template-rows]"
        style={{
          gridTemplateRows: isAnimatedVisible ? '1fr' : '0fr',
          transition: `grid-template-rows ${MOBILE_SELECTION_BAR_ANIMATION_MS}ms ${MOBILE_SELECTION_BAR_EASING} ${isVisible ? '0ms' : `${MOBILE_SELECTION_BAR_EXIT_LAYOUT_DELAY_MS}ms`}`,
        }}
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
            style={{
              transform: `translateY(${isAnimatedVisible ? '0' : '22px'})`,
              opacity: isAnimatedVisible ? 1 : 0,
              transition: `transform ${MOBILE_SELECTION_BAR_ANIMATION_MS}ms ${MOBILE_SELECTION_BAR_EASING} ${isVisible ? `${MOBILE_SELECTION_BAR_ENTER_CONTENT_DELAY_MS}ms` : '0ms'}, opacity ${isVisible ? MOBILE_SELECTION_BAR_ANIMATION_MS : MOBILE_SELECTION_BAR_EXIT_OPACITY_MS}ms ${MOBILE_SELECTION_BAR_EASING} ${isVisible ? `${MOBILE_SELECTION_BAR_ENTER_CONTENT_DELAY_MS}ms` : '0ms'}`,
              ...style,
            }}
            {...props}
          >
            <div className="flex shrink-0 items-center gap-200 pr-300">
              <span className="bg-button-primary text-text-inverse typo-caption1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px]">
                {effectiveSelectedCount}
              </span>
              <span className="typo-button2 text-text-alternative shrink-0">명 선택됨</span>
            </div>

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
        header={
          <div className="flex items-center justify-between">
            <div className="flex shrink-0 items-center gap-200">
              <span className="bg-button-primary text-text-inverse typo-caption1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px]">
                {effectiveSelectedCount}
              </span>
              <span className="typo-button2 text-text-alternative shrink-0">명 선택됨</span>
            </div>
            <button
              type="button"
              className="typo-button2 text-text-alternative cursor-pointer rounded-sm p-100"
              onClick={handleClearSelection}
            >
              선택 해제
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-100">
          {mainActions.map((action) => (
            <BottomSheetActionItem
              key={action.id}
              disabled={action.disabled}
              destructive={action.id === 'ban'}
              onClick={() => {
                if (action.disabled) return;
                setIsActionSheetOpen(false);
                setPendingAction(action);
              }}
            >
              {action.label}
            </BottomSheetActionItem>
          ))}

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
              onClick={() => {
                if (memberStateAction.disabled) return;
                setIsActionSheetOpen(false);
                setPendingAction(memberStateAction);
              }}
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
          overline={changeCardinalsOverline}
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
          title={pendingAction.title}
          description={pendingAction.description}
        >
          <AlertDialogAction onClick={handleActionConfirm}>확인</AlertDialogAction>
          <AlertDialogCancel>취소</AlertDialogCancel>
        </AlertDialog>
      )}
    </>
  );
}

export { MemberTopBar, MobileMemberTopBar, type MemberTopBarProps };
