'use client';

import React from 'react';

import { ArrowLeftIcon } from '@/assets/icons';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, Button, Icon } from '@/components/ui';
import { ChangeCardinalsModal } from '@/components/admin/member/modal/ChangeCardinalsModal';
import { cn } from '@/lib/cn';
import { getTopBarActions } from '@/constants/admin/memberTopBar.constants';

import type { ClubMemberRole } from '@/types/admin/member';

interface MemberTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCount: number;
  targetRole: ClubMemberRole | null;
  allBanned: boolean;
  onBack: () => void;
  onApprove?: () => void;
  onChangeRole?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onChangeCardinals?: (cardinalIds: number[]) => void;
  ref?: React.Ref<HTMLDivElement>;
}

function MemberTopBar({
  className,
  selectedCount,
  targetRole,
  allBanned,
  onBack,
  onApprove,
  onChangeRole,
  onResetPassword,
  onBan,
  onRestore,
  onChangeCardinals,
  ref,
  ...props
}: MemberTopBarProps) {
  if (selectedCount === 0) return null;

  const topBarActions = getTopBarActions({
    selectedCount,
    targetRole,
    allBanned,
    onApprove,
    onChangeRole,
    onResetPassword,
    onBan,
    onRestore,
  });

  return (
    <div
      ref={ref}
      className={cn('bg-container-primary flex h-15 items-center px-500', className)}
      {...props}
    >
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-200"
        >
          <Icon src={ArrowLeftIcon} alt="뒤로" size={16} className="text-text-inverse" />
        </button>

        <span className="typo-sub1 text-text-inverse ml-200 shrink-0">
          {selectedCount}명 선택됨
        </span>

        <div className="ml-auto flex items-center gap-200">
          {topBarActions.map(({ label, title, handler, disabled }) => (
            <AlertDialog
              key={label}
              title={title}
              trigger={
                <Button variant="secondary" size="lg" className="py-200" disabled={disabled}>
                  {label}
                </Button>
              }
            >
              <AlertDialogAction onClick={handler}>확인</AlertDialogAction>
              <AlertDialogCancel>취소</AlertDialogCancel>
            </AlertDialog>
          ))}

          {onChangeCardinals && (
            <ChangeCardinalsModal onSubmit={onChangeCardinals}>
              <Button variant="secondary" size="lg" className="py-200">
                기수 변경
              </Button>
            </ChangeCardinalsModal>
          )}
      </div>
    </div>
  );
}

export { MemberTopBar, type MemberTopBarProps };
