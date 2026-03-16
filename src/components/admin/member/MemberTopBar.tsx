'use client';

import React from 'react';

import { ArrowLeftIcon } from '@/assets/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Icon,
} from '@/components/ui';
import { ChangeGenerationModal } from '@/components/admin/member/ChangeGenerationModal';
import { cn } from '@/lib/cn';
import { getTopBarActions } from './memberTopBar.constants';
import { useGenerationConfirm } from '@/hooks';

interface MemberTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCount: number;
  canChangeToAdmin: boolean;
  canChangeToUser: boolean;
  onBack: () => void;
  onApprove?: () => void;
  onChangeToAdmin?: () => void;
  onChangeToUser?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
  onChangeGeneration?: (generation: number) => void;
  ref?: React.Ref<HTMLDivElement>;
}

function MemberTopBar({
  className,
  selectedCount,
  canChangeToAdmin,
  canChangeToUser,
  onBack,
  onApprove,
  onChangeToAdmin,
  onChangeToUser,
  onResetPassword,
  onBan,
  onChangeGeneration,
  ref,
  ...props
}: MemberTopBarProps) {
  const { genConfirmOpen, setGenConfirmOpen, pendingGeneration, handleGenSubmit, handleGenConfirm } =
    useGenerationConfirm(onChangeGeneration);

  if (selectedCount === 0) return null;

  const topBarActions = getTopBarActions({
    selectedCount,
    canChangeToAdmin,
    canChangeToUser,
    onApprove,
    onChangeToAdmin,
    onChangeToUser,
    onResetPassword,
    onBan,
  });

  return (
    <>
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
          <ChangeGenerationModal onSubmit={handleGenSubmit}>
            <Button variant="secondary" size="lg" className="py-200">
              기수 변경
            </Button>
          </ChangeGenerationModal>
        </div>
      </div>

      {/* Generation confirm alert */}
      <AlertDialog open={genConfirmOpen} onOpenChange={setGenConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCount}명의 멤버를 {pendingGeneration}기로 변경하시겠습니까?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleGenConfirm}>확인</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { MemberTopBar, type MemberTopBarProps };
