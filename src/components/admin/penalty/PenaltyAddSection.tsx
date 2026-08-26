'use client';

import type { ReactNode } from 'react';

import { Button, Input } from '@/components/ui';
import { PENALTY_SCORE_EMPTY } from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';
import type { PenaltyMember, PenaltyRecordDraft, PenaltyType } from '@/types/admin/penalty';
import { PenaltyMemberSearchInput } from './PenaltyMemberSearchInput';
import { PenaltyScoreInput } from './PenaltyScoreInput';
import { PenaltyTypeToggle } from './PenaltyTypeToggle';

interface PenaltyAddSectionProps {
  draft: PenaltyRecordDraft;
  onDraftChange: (draft: Partial<PenaltyRecordDraft>) => void;
  onSubmit: () => void;
  selectedMembers: PenaltyMember[];
  memberQuery: string;
  onMemberQueryChange: (query: string) => void;
  onRemoveMember: (id: string) => void;
}

function PenaltyAddSection({
  draft,
  onDraftChange,
  onSubmit,
  selectedMembers,
  memberQuery,
  onMemberQueryChange,
  onRemoveMember,
}: PenaltyAddSectionProps) {
  const isWarning = draft.type === 'WARNING';
  const canSubmit =
    draft.memberIds.length > 0 &&
    draft.reason.trim().length > 0 &&
    (isWarning || draft.score > PENALTY_SCORE_EMPTY);

  return (
    <section className="bg-background flex w-full flex-col overflow-hidden rounded-lg">
      <h2 className="typo-sub1 text-text-strong p-450">페널티/경고 추가</h2>

      <form
        className="flex w-full flex-wrap items-end gap-[14px] p-450"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <PenaltyFormField label="구분" className="w-40">
          <PenaltyTypeToggle
            value={draft.type}
            onValueChange={(type: PenaltyType) => onDraftChange({ type })}
          />
        </PenaltyFormField>

        <PenaltyFormField label="페널티 점수" className="w-40">
          <PenaltyScoreInput
            value={draft.score}
            disabled={isWarning}
            onValueChange={(score) => onDraftChange({ score })}
          />
        </PenaltyFormField>

        <div className="flex w-full min-w-0 items-end gap-[14px] min-[850px]:w-auto min-[850px]:flex-1">
          <PenaltyFormField label="멤버" className="min-w-0 flex-1">
            <PenaltyMemberSearchInput
              selectedMembers={selectedMembers}
              query={memberQuery}
              onQueryChange={onMemberQueryChange}
              onRemoveMember={onRemoveMember}
            />
          </PenaltyFormField>

          <PenaltyFormField label="사유" className="min-w-0 flex-1">
            <Input
              value={draft.reason}
              onChange={(event) => onDraftChange({ reason: event.target.value })}
              placeholder={`${isWarning ? '경고' : '페널티'} 사유를 작성해주세요`}
              aria-label="사유"
              className="typo-body1 h-12 px-400"
            />
          </PenaltyFormField>

          <Button type="submit" size="lg" disabled={!canSubmit} className="h-12 shrink-0">
            기록 추가
          </Button>
        </div>
      </form>
    </section>
  );
}

function PenaltyFormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex shrink-0 flex-col', className)}>
      <span className="typo-sub3 text-text-normal flex items-center px-100 py-200">{label}</span>
      {children}
    </div>
  );
}

export { PenaltyAddSection, type PenaltyAddSectionProps };
