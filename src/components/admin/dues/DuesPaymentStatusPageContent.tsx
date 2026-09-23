'use client';

import { useParams } from 'next/navigation';

import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useDuesDashboardQuery } from '@/hooks/queries/admin/useDuesDashboardQuery';
import { useDuesPaymentTargetsQuery } from '@/hooks/queries/admin/useDuesSetupQueries';
import { usePaymentTargetActions } from '@/hooks/admin/usePaymentTargetActions';
import type { PaymentTarget } from '@/types/admin/dues';

import { DuesMemberPaymentTable, type DuesMember } from './DuesMemberPaymentTable';
import { DuesPaymentSummaryCard } from './DuesPaymentSummaryCard';
import { DuesPaymentStatusPageSkeleton } from './DuesPaymentStatusPageSkeleton';
import { DuesPaymentStatCard } from './DuesPaymentStatCard';
import { DuesPaymentAccountCard } from './DuesPaymentAccountCard';
import { BackButton } from './BackButton';
import { MemberSelectHeader } from './MemberSelectHeader';

// PaymentTarget의 targetStatus/paymentStatus를 테이블 행 표시 상태로 합친다.
// EXCLUDED(제외)면 납부 상태와 무관하게 'excluded', 그 외에는 납부 상태를 그대로 매핑한다.
function toMemberStatus(target: PaymentTarget): DuesMember['status'] {
  if (target.targetStatus === 'EXCLUDED') return 'excluded';
  if (target.paymentStatus === 'PAID') return 'paid';
  if (target.paymentStatus === 'REFUNDED') return 'refunded';
  return 'unpaid';
}

// 납부 대상(PaymentTarget) → 테이블이 쓰는 DuesMember 형태로 변환
function toDuesMember(target: PaymentTarget): DuesMember {
  const { paymentTargetInfo } = target;
  return {
    id: paymentTargetInfo.clubMemberId,
    name: paymentTargetInfo.name,
    major: paymentTargetInfo.department,
    phone: paymentTargetInfo.tel,
    status: toMemberStatus(target),
    profileImageUrl: paymentTargetInfo.profileImageUrl ?? '',
  };
}

function DuesPaymentStatusPageContent() {
  const { clubId } = useParams<{ clubId: string }>();
  const { activeCardinal } = useCardinalSelector({ autoSelectLatest: true, scope: 'dues' });

  // 대시보드로 accountId·계좌 정보를 확보한 뒤 납부 대상 목록을 조회한다.
  const { data: dashboard, isPending: isDashboardPending } = useDuesDashboardQuery(
    clubId,
    activeCardinal?.cardinalNumber ?? null,
  );
  const { data: paymentTargets, isPending: isTargetsPending } = useDuesPaymentTargetsQuery(
    clubId,
    dashboard?.accountId ?? null,
  );

  // 테이블에는 제외(EXCLUDED) 부원까지 모두 노출하되, 벌크 액션은 실제 납부 대상(TARGETED)만 사용한다.
  const allTargets = paymentTargets?.targets.content ?? [];
  const targeted = allTargets.filter((t) => t.targetStatus === 'TARGETED');
  const members: DuesMember[] = allTargets.map(toDuesMember);

  const actions = usePaymentTargetActions({
    clubId,
    accountId: dashboard?.accountId ?? null,
    targeted,
    members,
  });

  // 인원 집계는 서버 집계값(paymentSummary)을 신뢰한다. paidCount는 환불 인원을 제외하므로
  // 미납 = 전체 - 납부완료로 두면 환불 인원이 미납에 포함돼 총 수납액과 방향이 일치한다.
  const totalCount = dashboard?.paymentSummary.totalTargetCount ?? 0;
  const paidCount = dashboard?.paymentSummary.paidCount ?? 0;
  const unpaidCount = totalCount - paidCount;

  // 환불해도 paidAmount는 이력으로 남으므로, 실제 수납액은 PAID 상태만 합산한다.
  const totalTarget = dashboard?.summary.totalAmount ?? 0;
  const totalCollected = targeted
    .filter((t) => t.paymentStatus === 'PAID')
    .reduce((sum, t) => sum + t.paidAmount, 0);

  const account = dashboard?.bankAccount;
  const generationLabel = activeCardinal ? `${activeCardinal.cardinalNumber}기` : '';

  // 기수가 선택된 뒤 대시보드/납부 대상 로딩 중이면 스켈레톤을 노출한다.
  // 대시보드 accountId 확보 전에는 납부 대상 쿼리가 skipToken(pending)이므로 accountId가 있을 때만 그 로딩을 반영한다.
  if (
    activeCardinal &&
    (isDashboardPending || (dashboard?.accountId != null && isTargetsPending))
  ) {
    return <DuesPaymentStatusPageSkeleton />;
  }

  return (
    <div className="flex min-w-85 flex-col">
      {/* Selection top bar — sticky top-0 z-10 -mt-15 로 Header 영역에 오버레이 */}
      {actions.selectedStatus !== null && (
        <MemberSelectHeader
          selectedCount={actions.selectedIds.size}
          selectedStatus={actions.selectedStatus}
          onClear={actions.clearSelection}
          onMarkUnpaid={actions.onMarkUnpaid}
          onRefund={actions.onRefund}
          onMarkPaid={actions.onMarkPaid}
          onExclude={actions.onExclude}
        />
      )}

      <div className="tablet:p-700 flex flex-col gap-700 p-400">
        {/* 헤더 */}
        <div className="flex flex-col gap-400">
          <BackButton />
          <h1 className="text-text-strong text-[28px] leading-9 font-bold tracking-[-0.14px]">
            {generationLabel} 회비 납부 현황
          </h1>
        </div>

        {/* 상단 섹션 */}
        <div className="flex flex-wrap items-stretch gap-600">
          <DuesPaymentSummaryCard totalCollected={totalCollected} totalTarget={totalTarget} />
          <div className="tablet:w-84.75 flex w-full flex-col gap-400">
            <DuesPaymentStatCard label="미납 인원" value={`${unpaidCount}명`} />
            <DuesPaymentStatCard label="납부 대상" value={`${totalCount}명`} />
            {account && (
              <DuesPaymentAccountCard
                bankName={account.bankName}
                accountNumber={account.accountNumber}
                holderName={account.holder}
                isPublic={dashboard?.bankAccountPublic ?? false}
              />
            )}
          </div>
        </div>

        {/* 부원별 납부현황 테이블 */}
        <DuesMemberPaymentTable
          members={members}
          selectedIds={actions.selectedIds}
          onSelectionChange={actions.setSelectedIds}
        />
      </div>
    </div>
  );
}

export { DuesPaymentStatusPageContent };
