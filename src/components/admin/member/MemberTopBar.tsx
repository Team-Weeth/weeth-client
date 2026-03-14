'use client';

import React from 'react';
import Image from 'next/image';

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
  const [genDialogOpen, setGenDialogOpen] = React.useState(false);
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
          <Image src={ArrowLeftIcon} alt="뒤로" width={6} height={6} className="invert" />
        </button>

        <span className="typo-sub1 text-text-inverse ml-200 shrink-0">
          {selectedCount}명 선택됨
        </span>

        <div className="ml-auto flex items-center gap-200">
          <AlertDialog
            title={`${selectedCount}명의 멤버 가입을 승인하시겠습니까?`}
            trigger={
              <Button variant="secondary" size="lg" className="py-200">
                가입 승인
              </Button>
            }
          >
            <AlertDialogAction onClick={onApprove}>확인</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialog>

          <AlertDialog
            title={`${selectedCount}명의 멤버 역할을 관리자로 변경하시겠습니까?`}
            trigger={
              <Button variant="secondary" size="lg" className="py-200" disabled={!canChangeToAdmin}>
                관리자로 변경
              </Button>
            }
          >
            <AlertDialogAction onClick={onChangeToAdmin}>확인</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialog>

          <AlertDialog
            title={`${selectedCount}명의 멤버 역할을 사용자로 변경하시겠습니까?`}
            trigger={
              <Button variant="secondary" size="lg" className="py-200" disabled={!canChangeToUser}>
                사용자로 변경
              </Button>
            }
          >
            <AlertDialogAction onClick={onChangeToUser}>확인</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialog>

          <AlertDialog
            title={`${selectedCount}명의 멤버 비밀번호를 초기화 시키시겠습니까?`}
            trigger={
              <Button variant="secondary" size="lg" className="py-200">
                비밀번호 초기화
              </Button>
            }
          >
            <AlertDialogAction onClick={onResetPassword}>확인</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialog>

          <AlertDialog
            title={`${selectedCount}명의 멤버를 추방하시겠습니까?`}
            trigger={
              <Button variant="secondary" size="lg" className="py-200">
                유저 추방
              </Button>
            }
          >
            <AlertDialogAction onClick={onBan}>확인</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialog>

          <Button
            variant="secondary"
            size="lg"
            className="py-200"
            onClick={() => setGenDialogOpen(true)}
          >
            기수 변경
          </Button>
        </div>
      </div>

      {/* Generation change modal */}
      <ChangeGenerationModal
        open={genDialogOpen}
        onOpenChange={setGenDialogOpen}
        onSubmit={handleGenSubmit}
      />

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
