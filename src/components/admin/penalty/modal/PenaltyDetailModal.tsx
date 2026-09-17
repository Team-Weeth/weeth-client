'use client';

import { AdminCloseIcon } from '@/assets/icons/admin';
import { MemberStatusBadge } from '@/components/admin/member/MemberStatusBadge';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { ScheduleTag } from '@/components/admin/schedule/general/ScheduleTag';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import type { PenaltyMember, PenaltyRecord } from '@/types/admin/penalty';
import { formatCardinalLabel, getVisibleMemberCardinals } from '@/utils/admin/memberTableUtils';
import { PenaltyCountSummary } from './PenaltyCountSummary';
import { PenaltyRecordTable } from './PenaltyRecordTable';

interface PenaltyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: PenaltyMember | null;
  records: PenaltyRecord[];
  cardinalNumber: number | null;
  onUpdateRecord?: (record: PenaltyRecord, next: { reason: string; score: number }) => void;
  onDeleteRecord?: (record: PenaltyRecord) => void;
}

function PenaltyDetailModal({
  open,
  onOpenChange,
  member,
  records,
  cardinalNumber,
  onUpdateRecord,
  onDeleteRecord,
}: PenaltyDetailModalProps) {
  if (!member) return null;

  const cardinalRecords = records.filter((record) => record.cardinal === cardinalNumber);

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background max-tablet:h-dvh flex w-[720px] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        <div className="max-tablet:px-400 max-tablet:py-400 flex shrink-0 items-center justify-between gap-300 px-700 pt-600 pb-450">
          <DialogTitle className="typo-h3 text-text-strong">
            {cardinalNumber !== null ? `${cardinalNumber}기 페널티 상세` : '페널티 상세'}
          </DialogTitle>
          <ModalIconButton size={18} icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        <div className="max-tablet:h-auto max-tablet:min-h-0 max-tablet:flex-1 max-tablet:overflow-y-auto max-tablet:px-400 max-tablet:gap-400 flex h-[560px] flex-col gap-500 overflow-hidden px-700 pt-200 pb-600">
          <PenaltyMemberSummary member={member} />
          <PenaltyCountSummary
            penaltyCount={cardinalRecords.filter((record) => record.type === 'PENALTY').length}
            warningCount={cardinalRecords.filter((record) => record.type === 'WARNING').length}
          />
          <PenaltyRecordTable
            records={cardinalRecords}
            onUpdate={onUpdateRecord}
            onDelete={onDeleteRecord}
          />
        </div>

        <div className="bg-container-neutral max-tablet:pb-[max(16px,env(safe-area-inset-bottom))] max-tablet:[&>button]:flex-1 flex shrink-0 items-center justify-end gap-200 px-400 pt-400 pb-500">
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={handleClose}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PenaltyMemberSummary({ member }: { member: PenaltyMember }) {
  const { visibleCardinals, hiddenCardinalCount } = getVisibleMemberCardinals(member.cardinal);

  return (
    <section className="bg-container-neutral max-tablet:gap-300 max-tablet:p-400 flex shrink-0 items-center gap-500 rounded-lg px-500 py-450">
      <Avatar size={64}>
        {member.profileImageUrl && (
          <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} />
        )}
        <AvatarFallback />
      </Avatar>

      <div className="flex min-w-0 flex-col gap-100">
        <div className="max-tablet:flex-wrap flex min-w-0 items-center gap-200">
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
