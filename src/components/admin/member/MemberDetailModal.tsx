'use client';

import React from 'react';

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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChangeGenerationModal } from '@/components/admin/member/ChangeGenerationModal';
import { cn } from '@/lib/cn';

type MemberDetailStatus = 'approved' | 'pending' | 'banned';

interface MemberDetail {
  name: string;
  generation: number;
  status: MemberDetailStatus;
  position: string;
  role: string;
  department: string;
  phone: string;
  studentId: string;
  email: string;
  activeGenerations: string;
  memberStatus: string;
  joinDate: string;
  attendance: number;
  absence: number;
  penalty: number;
}

const STATUS_LABEL: Record<MemberDetailStatus, string> = {
  approved: '승인 완료',
  pending: '대기 중',
  banned: '추방',
};

const STATUS_DOT_COLOR: Record<MemberDetailStatus, string> = {
  approved: 'bg-container-primary',
  pending: 'bg-state-caution',
  banned: 'bg-state-error',
};

interface MemberDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberDetail | null;
  onApprove?: () => void;
  onChangeToAdmin?: () => void;
  onResetPassword?: () => void;
  onBan?: () => void;
  onChangeGeneration?: (generation: number) => void;
}

function MemberDetailModal({
  open,
  onOpenChange,
  member,
  onApprove,
  onChangeToAdmin,
  onResetPassword,
  onBan,
  onChangeGeneration,
}: MemberDetailModalProps) {
  const [genDialogOpen, setGenDialogOpen] = React.useState(false);
  const [genConfirmOpen, setGenConfirmOpen] = React.useState(false);
  const [pendingGeneration, setPendingGeneration] = React.useState(0);

  if (!member) return null;

  const handleClose = () => onOpenChange(false);

  const handleGenSubmit = (generation: number) => {
    setPendingGeneration(generation);
    setGenConfirmOpen(true);
  };

  const handleGenConfirm = () => {
    onChangeGeneration?.(pendingGeneration);
    setGenConfirmOpen(false);
    setPendingGeneration(0);
  };

  const personalInfo = [
    { label: '직급', value: member.position },
    { label: '역할', value: member.role },
    { label: '학과', value: member.department },
    { label: '전화번호', value: member.phone },
    { label: '학번', value: member.studentId },
    { label: '이메일', value: member.email },
  ];

  const activityStats = [
    { label: '출석', value: member.attendance, color: 'text-text-strong' },
    { label: '결석', value: member.absence, color: 'text-text-strong' },
    {
      label: '패널티',
      value: member.penalty,
      color: member.penalty > 0 ? 'text-state-error' : 'text-text-strong',
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="bg-background flex w-215 max-w-[860px] flex-col gap-0 rounded-sm p-0"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-600 pt-700 pb-400">
            <h2 className="typo-h3 text-text-normal">멤버 관리 상세</h2>
            <button
              type="button"
              onClick={handleClose}
              className="flex cursor-pointer items-center justify-center rounded-sm p-200"
              aria-label="닫기"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.2 12L17.7 7.5C17.8833 7.31667 17.975 7.09167 17.975 6.825C17.975 6.55833 17.8833 6.33333 17.7 6.15C17.5167 5.96667 17.2917 5.875 17.025 5.875C16.7583 5.875 16.5333 5.96667 16.35 6.15L12 10.5L7.5 6.15C7.31667 5.96667 7.09167 5.875 6.825 5.875C6.55833 5.875 6.33333 5.96667 6.15 6.15C5.96667 6.33333 5.875 6.55833 5.875 6.825C5.875 7.09167 5.96667 7.31667 6.15 7.5L10.5 12L6.15 16.35C5.96667 16.5333 5.875 16.7583 5.875 17.025C5.875 17.2917 5.96667 17.5167 6.15 17.7C6.33333 17.8833 6.55833 17.975 6.825 17.975C7.09167 17.975 7.31667 17.8833 7.5 17.7L12 13.2L16.35 17.7C16.5333 17.8833 16.7583 17.975 17.025 17.975C17.2917 17.975 17.5167 17.8833 17.7 17.7C17.8833 17.5167 17.975 17.2917 17.975 17.025C17.975 16.7583 17.8833 16.5333 17.7 16.35L13.2 12Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex gap-500 px-700 pb-500">
            {/* 회원정보 */}
            <div className="bg-container-neutral flex-1 rounded-md p-400">
              <p className="typo-caption1 text-text-alternative mb-400">회원정보</p>

              <div className="mb-200 flex items-baseline gap-200">
                <span className="typo-h3 text-text-strong">{member.name}</span>
                <span className="typo-h3 text-text-strong">{member.generation}기</span>
              </div>

              <div className="mb-400 flex items-center gap-200">
                <span className={cn('size-1', STATUS_DOT_COLOR[member.status])} />
                <span className="typo-caption2 text-text-strong">
                  {STATUS_LABEL[member.status]}
                </span>
              </div>

              <div className="flex flex-col gap-400">
                {personalInfo.map(({ label, value }) => (
                  <div key={label} className="flex items-start">
                    <span className="typo-body1 text-text-alternative w-24 shrink-0">{label}</span>
                    <span className="typo-body1 text-text-strong">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 활동정보 */}
            <div className="bg-container-neutral w-80 shrink-0 rounded-md p-400">
              <p className="typo-caption1 text-text-alternative mb-400">활동정보</p>

              <div className="flex flex-col gap-400">
                <div className="flex items-start">
                  <span className="typo-body1 text-text-alternative w-24 shrink-0">활동기수</span>
                  <span className="typo-body1 text-text-strong">{member.activeGenerations}</span>
                </div>
                <div className="flex items-start">
                  <span className="typo-body1 text-text-alternative w-24 shrink-0">상태</span>
                  <span className="typo-body1 text-text-strong">{member.memberStatus}</span>
                </div>
                <div className="flex items-start">
                  <span className="typo-body1 text-text-alternative w-24 shrink-0">가입일</span>
                  <span className="typo-body1 text-text-strong">{member.joinDate}</span>
                </div>
              </div>

              <div className="mt-500 flex flex-col gap-200">
                {activityStats.map(({ label, value, color }) => (
                  <div key={label} className="flex items-start">
                    <span className="typo-body1 text-text-alternative w-24 shrink-0">{label}</span>
                    <span className={cn('typo-body1', color)}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-container-neutral flex items-center justify-between rounded-b-sm px-400 pt-400 pb-500">
            <div className="flex items-center gap-200">
              <AlertDialog
                title="1명의 멤버 가입을 승인하시겠습니까?"
                trigger={
                  <Button variant="secondary" size="lg">
                    가입 승인
                  </Button>
                }
              >
                <AlertDialogAction onClick={onApprove}>확인</AlertDialogAction>
                <AlertDialogCancel>취소</AlertDialogCancel>
              </AlertDialog>

              <AlertDialog
                title="1명의 멤버 역할을 관리자로 변경하시겠습니까?"
                trigger={
                  <Button variant="secondary" size="lg">
                    관리자로 변경
                  </Button>
                }
              >
                <AlertDialogAction onClick={onChangeToAdmin}>확인</AlertDialogAction>
                <AlertDialogCancel>취소</AlertDialogCancel>
              </AlertDialog>

              <AlertDialog
                title="1명의 멤버 비밀번호를 초기화 시키시겠습니까?"
                trigger={
                  <Button variant="secondary" size="lg">
                    비밀번호 초기화
                  </Button>
                }
              >
                <AlertDialogAction onClick={onResetPassword}>확인</AlertDialogAction>
                <AlertDialogCancel>취소</AlertDialogCancel>
              </AlertDialog>

              <AlertDialog
                title="1명의 멤버를 추방하시겠습니까?"
                trigger={
                  <Button variant="secondary" size="lg">
                    유저 추방
                  </Button>
                }
              >
                <AlertDialogAction onClick={onBan}>확인</AlertDialogAction>
                <AlertDialogCancel>취소</AlertDialogCancel>
              </AlertDialog>
              {/* Generation change modal */}
              <ChangeGenerationModal onSubmit={handleGenSubmit}>
                <Button variant="secondary" size="lg" onClick={() => setGenDialogOpen(true)}>
                  기수 변경
                </Button>
              </ChangeGenerationModal>
            </div>

            <Button variant="primary" size="lg" onClick={handleClose}>
              완료
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generation confirm alert */}
      <AlertDialog open={genConfirmOpen} onOpenChange={setGenConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              1명의 멤버를 {pendingGeneration}기로 변경하시겠습니까?
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

export {
  MemberDetailModal,
  type MemberDetailModalProps,
  type MemberDetail,
  type MemberDetailStatus,
};
