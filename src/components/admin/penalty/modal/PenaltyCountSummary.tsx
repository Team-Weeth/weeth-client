'use client';

import { useClubFeatures } from '@/providers/club-feature-provider';

interface PenaltyCountSummaryProps {
  penaltyCount: number;
  warningCount: number;
}

export function PenaltyCountSummary({ penaltyCount, warningCount }: PenaltyCountSummaryProps) {
  const { warningEnabled } = useClubFeatures();
  return (
    <dl className="bg-container-neutral flex shrink-0 items-center rounded-[10px]">
      <div className="flex min-w-0 flex-1 items-center gap-[20px] p-[15px]">
        <dt className="typo-sub3 text-text-alternative">페널티</dt>
        <dd className="typo-sub1 text-text-normal">{penaltyCount}회</dd>
      </div>
      {warningEnabled && (
        <>
          <div aria-hidden="true" className="bg-line h-5 w-px shrink-0" />
          <div className="flex min-w-0 flex-1 items-center gap-[20px] p-[15px]">
            <dt className="typo-sub3 text-text-alternative">경고</dt>
            <dd className="typo-sub1 text-text-normal">{warningCount}회</dd>
          </div>
        </>
      )}
    </dl>
  );
}
