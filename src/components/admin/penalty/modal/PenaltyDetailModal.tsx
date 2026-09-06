'use client';

import { useState } from 'react';

import { AdminCloseIcon } from '@/assets/icons/admin';
import { MemberStatusBadge } from '@/components/admin/member/MemberStatusBadge';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { ScheduleTag } from '@/components/admin/schedule/general/ScheduleTag';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from '@/components/ui';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import type { PenaltyMember, PenaltyRecord } from '@/types/admin/penalty';
import { formatCardinalLabel, getVisibleMemberCardinals } from '@/utils/admin/memberTableUtils';
import { PenaltyRecordTable } from './PenaltyRecordTable';

interface PenaltyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: PenaltyMember | null;
  records: PenaltyRecord[];
  onUpdateRecord?: (record: PenaltyRecord, next: { reason: string; score: number }) => void;
  onDeleteRecord?: (record: PenaltyRecord) => void;
}

function PenaltyDetailModal({
  open,
  onOpenChange,
  member,
  records,
  onUpdateRecord,
  onDeleteRecord,
}: PenaltyDetailModalProps) {
  const [pendingDelete, setPendingDelete] = useState<PenaltyRecord | null>(null);

  if (!member) return null;

  const handleClose = () => onOpenChange(false);

  const handleConfirmDelete = () => {
    if (pendingDelete) onDeleteRecord?.(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-[720px] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-700 pt-600 pb-450">
          <DialogTitle className="typo-h3 text-text-strong">페널티 상세</DialogTitle>
          <ModalIconButton size={18} icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        <div className="max-tablet:h-auto max-tablet:flex-1 flex h-[560px] flex-col gap-500 overflow-hidden px-700 pt-200 pb-600">
          <PenaltyMemberSummary member={member} />
          <PenaltyRecordTable
            records={records}
            onUpdate={onUpdateRecord}
            onDelete={setPendingDelete}
          />
        </div>

        <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={handleClose}>
            확인
          </Button>
        </div>
      </DialogContent>

      <AlertDialog
        status="danger"
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>페널티 기록을 삭제하시겠어요?</AlertDialogTitle>
            {/* 디자인에는 보조 설명이 없지만 alertdialog는 설명이 필수라 스크린리더에만 제공한다 */}
            <AlertDialogDescription className="sr-only">
              삭제한 페널티 기록은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

function PenaltyMemberSummary({ member }: { member: PenaltyMember }) {
  const { visibleCardinals, hiddenCardinalCount } = getVisibleMemberCardinals(member.cardinal);

  return (
    <section className="bg-container-neutral flex shrink-0 items-center gap-500 rounded-lg px-500 py-450">
      <Avatar size={64}>
        {member.profileImageUrl && (
          <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} />
        )}
        <AvatarFallback />
      </Avatar>

      <div className="flex min-w-0 flex-col gap-100">
        <div className="flex min-w-0 items-center gap-200">
          <span className="typo-sub1 text-text-normal truncate">{member.name}</span>
          {visibleCardinals.map((cardinal) => (
            <ScheduleTag variant="type" key={cardinal}>
              {formatCardinalLabel(cardinal)}
            </ScheduleTag>
          ))}
          {hiddenCardinalCount > 0 && (
            <ScheduleTag variant="info">+{hiddenCardinalCount}</ScheduleTag>
          )}
        </div>
        <MemberStatusBadge status={member.status} variant="dot" />
        <p
          className={cn(
            'typo-body2 truncate',
            member.introduction ? 'text-text-alternative' : 'text-text-disabled',
          )}
        >
          {member.introduction || '-'}
        </p>
      </div>
    </section>
  );
}

export { PenaltyDetailModal, type PenaltyDetailModalProps };
