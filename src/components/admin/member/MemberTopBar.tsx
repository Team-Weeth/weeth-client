'use client';

import React from 'react';
import Image from 'next/image';

import { AdminBackarrowIcon } from '@/assets/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  TextField,
} from '@/components/ui';
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
  const [genInput, setGenInput] = React.useState('');
  const [genConfirmOpen, setGenConfirmOpen] = React.useState(false);

  if (selectedCount === 0) return null;

  const handleGenSubmit = () => {
    if (!genInput.trim()) return;
    setGenDialogOpen(false);
    setGenConfirmOpen(true);
  };

  const handleGenConfirm = () => {
    onChangeGeneration?.(parseInt(genInput, 10));
    setGenConfirmOpen(false);
    setGenInput('');
  };

  return (
    <>
      <div
        ref={ref}
        className={cn(
          'bg-container-primary flex items-center px-500 py-300',
          className,
        )}
        {...props}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center justify-center rounded-sm p-200"
        >
          <Image
            src={AdminBackarrowIcon}
            alt="뒤로"
            width={24}
            height={24}
          />
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
              <Button
                variant="secondary"
                size="lg"
                className="py-200"
                disabled={!canChangeToAdmin}
              >
                관리자로 변경
              </Button>
            }
          >
            <AlertDialogAction onClick={onChangeToAdmin}>
              확인
            </AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialog>

          <AlertDialog
            title={`${selectedCount}명의 멤버 역할을 사용자로 변경하시겠습니까?`}
            trigger={
              <Button
                variant="secondary"
                size="lg"
                className="py-200"
                disabled={!canChangeToUser}
              >
                사용자로 변경
              </Button>
            }
          >
            <AlertDialogAction onClick={onChangeToUser}>
              확인
            </AlertDialogAction>
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
            <AlertDialogAction onClick={onResetPassword}>
              확인
            </AlertDialogAction>
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

      {/* Generation input dialog */}
      <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기수 변경</DialogTitle>
          </DialogHeader>
          <TextField
            placeholder="변경할 기수를 입력하세요"
            value={genInput}
            onChange={(e) => setGenInput(e.target.value)}
            type="number"
          />
          <DialogFooter>
            <Button variant="primary" onClick={handleGenSubmit}>
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generation confirm alert */}
      <AlertDialog open={genConfirmOpen} onOpenChange={setGenConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCount}명의 멤버를 {genInput}기로 변경하시겠습니까?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleGenConfirm}>
              확인
            </AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { MemberTopBar, type MemberTopBarProps };
