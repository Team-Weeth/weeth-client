'use client';

import React from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, Button } from '@/components/ui';
import { ChangeCardinalsModal } from '@/components/admin/member/modal/ChangeCardinalsModal';
import { FloatingSelectionBar } from '@/components/admin/FloatingSelectionBar';
import { cn } from '@/lib/cn';
import { getTopBarActions } from '@/constants/admin/memberTopBar.constants';

import type { ClubMemberRole } from '@/types/admin/member';

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
      className={className}
      {...props}
    >
      {topBarActions.map(({ label, title, description, handler, disabled }) => (
        <AlertDialog
          key={label}
          title={title}
          description={description}
          trigger={
            <Button
              variant="secondary"
              size="md"
              className={cn(
                'typo-button2 bg-static-on-floating text-container-floating hover:bg-static-on-floating/90 shrink-0 rounded-sm px-300 py-200 whitespace-nowrap',
                label.includes('추방') && 'text-state-error',
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

export { MemberTopBar, type MemberTopBarProps };
