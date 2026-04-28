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
  targetBanAction: 'ban' | 'restore' | null;
  onBack: () => void;
  onApprove?: () => void;
  onChangeRole?: () => void;
  // onResetPassword?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onChangeCardinals?: (cardinalIds: number[]) => void;
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
  // onResetPassword,
  onBan,
  onRestore,
  onChangeCardinals,
  onTransferLead,
  ref,
  ...props
}: MemberTopBarProps) {
  if (selectedCount === 0) return null;

  const topBarActions = getTopBarActions({
    selectedCount,
    targetRole,
    targetBanAction,
    onApprove,
    onChangeRole,
    // onResetPassword,
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

      <span className="typo-sub1 text-text-inverse ml-200 shrink-0">{selectedCount}명 선택됨</span>

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
        {onTransferLead && (
          <AlertDialog
            title={'해당 멤버에게\n리더 권한을 이양하시겠습니까?'}
            description={'리더는 동아리별로\n1명만 지정할 수 있습니다'}
            trigger={
              <Button variant="secondary" size="lg" className="py-200">
                리더로 변경
              </Button>
            }
          >
            <AlertDialogAction onClick={onTransferLead}>확인</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export { MemberTopBar, type MemberTopBarProps };
