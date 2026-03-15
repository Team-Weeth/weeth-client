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
  const [genConfirmOpen, setGenConfirmOpen] = React.useState(false);
  const [pendingGeneration, setPendingGeneration] = React.useState(0);

  if (selectedCount === 0) return null;

  const handleGenSubmit = (generation: number) => {
    setPendingGeneration(generation);
    setGenConfirmOpen(true);
  };

  const handleGenConfirm = () => {
    onChangeGeneration?.(pendingGeneration);
    setGenConfirmOpen(false);
    setPendingGeneration(0);
  };

  const topBarActions = [
    {
      label: '가입 승인',
      title: `${selectedCount}명의 멤버 가입을 승인하시겠습니까?`,
      handler: onApprove,
      disabled: false,
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
      disabled: false,
    },
    {
      label: '유저 추방',
      title: `${selectedCount}명의 멤버를 추방하시겠습니까?`,
      handler: onBan,
      disabled: false,
    },
  ];

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
