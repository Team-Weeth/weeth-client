'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import type { MonthlyData } from '@/types/admin/dues';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useDuesVisibilityToggle } from '@/hooks/admin/useDuesVisibilityToggle';
import {
  isDuesNotRegisteredError,
  useDuesDashboardQuery,
} from '@/hooks/queries/admin/useDuesDashboardQuery';
import { useDuesTransactionList } from '@/hooks/admin/useDuesTransactionList';
import { useDuesTransactionModals } from '@/hooks/admin/useDuesTransactionModals';
import { useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { DuesPageSkeleton } from './DuesPageSkeleton';
import { DuesTopBar } from './DuesTopBar';
import { DuesBalanceCard } from './DuesBalanceCard';
import { DuesChart } from './DuesChart';
import { DuesGenerationFilter } from './DuesGenerationFilter';
import { TransactionFormModal } from './modal/TransactionFormModal';
import { TransactionDetailModal } from './modal/TransactionDetailModal';
import { DuesTransactionTable } from './DuesTransactionTable';
import { DuesOnboardingOverlay } from './DuesOnboardingOverlay';
import { toMonthLabel, toPeriodLabel } from '@/utils/shared/date';

function DuesPageContent() {
  const [activeMonth, setActiveMonth] = useState('');
  const { cardinals, setSelectedCardinalId, activeCardinal } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'dues',
  });
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { reset, setField } = useDuesSetupActions();

  // 회비 대시보드 조회. 등록이 완료되지 않은 장부(20112)면 온보딩 튜토리얼 모달을 띄운다.
  const {
    data: dashboard,
    error: dashboardError,
    isPending: isDashboardPending,
  } = useDuesDashboardQuery(clubId, activeCardinal?.cardinalNumber ?? null);
  const isNotRegistered = isDuesNotRegisteredError(dashboardError);
  const accountId = dashboard?.accountId ?? null;

  const {
    transactionsData,
    filter: txFilter,
    sortDesc: txSortDesc,
    page: txPage,
    setPage: setTxPage,
    handleTabChange: handleTxTabChange,
    handleSortToggle: handleTxSortToggle,
  } = useDuesTransactionList(clubId, accountId);

  const modals = useDuesTransactionModals({
    clubId,
    accountId,
    startYearMonth: dashboard?.period.startYearMonth,
  });

  const { isPublic, handlePublicChange } = useDuesVisibilityToggle(
    clubId,
    accountId,
    dashboard?.memberVisible,
  );

  // 월별 잔액 추이 차트 데이터 (yearMonth → 'N월', endingBalance → 막대 높이)
  const monthlyData: MonthlyData[] =
    dashboard?.monthlyBalances.map((balance) => ({
      month: toMonthLabel(balance.yearMonth),
      amount: balance.endingBalance,
    })) ?? [];

  // 선택된 월이 없으면 가장 최근 월을 기본 활성화
  const effectiveMonth = activeMonth || (monthlyData.at(-1)?.month ?? '');
  const activeBalance = dashboard?.monthlyBalances.find(
    (balance) => toMonthLabel(balance.yearMonth) === effectiveMonth,
  );

  // 메인 화면에서 온보딩 신규 진입 시: store 초기화 + 신규 진입 플래그 세팅 후 step1로 이동
  // (accountId 잔존값을 비워 createDraft 재호출을 보장하고, alert 노출을 신규 진입으로 한정)
  const startDuesSetup = () => {
    reset();
    setField({ isFreshEntry: true });
    router.push(`/${clubId}/admin/dues/setup/1`);
  };

  const handleSetting = () => {
    router.push(`/${clubId}/admin/dues/setting`);
  };

  // 기수가 선택된 상태에서 대시보드 로딩 중일 때만 스켈레톤을 노출한다.
  // 기수가 하나도 없으면 activeCardinal이 계속 null(쿼리 skipToken)이라 스켈레톤이 무한 노출되므로 제외한다.
  // 등록 미완료(20112)는 에러 상태라 isPending=false이므로 아래 튜토리얼 모달 흐름으로 넘어간다.
  if (activeCardinal && isDashboardPending) {
    return <DuesPageSkeleton />;
  }

  return (
    <div className="tablet:p-700 flex min-w-85 flex-col gap-400 p-400">
      <DuesTopBar
        isPublic={isPublic}
        onPublicChange={handlePublicChange}
        onSettingsClick={handleSetting}
        disabled={isNotRegistered}
      />
      <DuesGenerationFilter
        isNotRegistered={isNotRegistered}
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        updaterProfile={dashboard?.lastModified ?? undefined}
        onSelect={setSelectedCardinalId}
      />
      {/* 미등록 기수(20112)일 때는 콘텐츠 영역만 오버레이로 덮어 상단 기수 필터는 조작 가능하게 둔다 */}
      <div className="relative flex flex-col gap-400">
        <div className="tablet:flex-row flex flex-col gap-1">
          <DuesBalanceCard
            currentBalance={dashboard?.summary.currentBalance ?? 0}
            paidCount={dashboard?.paymentSummary.paidCount ?? 0}
            totalCount={dashboard?.paymentSummary.totalTargetCount ?? 0}
            bankName={dashboard?.bankAccount?.bankName ?? ''}
            accountNumber={dashboard?.bankAccount?.accountNumber ?? ''}
            holderName={dashboard?.bankAccount?.holder ?? ''}
            isAccountPublic={dashboard?.bankAccountPublic ?? false}
            onViewPaymentDetail={() => router.push(`/${clubId}/admin/dues/payment-status`)}
            onAddTransaction={modals.openAddModal}
          />
          <DuesChart
            data={monthlyData}
            activeMonth={effectiveMonth}
            onMonthChange={setActiveMonth}
            periodStart={toPeriodLabel(dashboard?.period.startYearMonth)}
            periodEnd={toPeriodLabel(dashboard?.period.endYearMonth)}
            activeExpense={activeBalance?.expense ?? 0}
            activeIncome={activeBalance?.income ?? 0}
          />
        </div>
        <DuesTransactionTable
          transactions={transactionsData?.transactions ?? []}
          counts={transactionsData?.counts ?? { all: 0, expense: 0, income: 0, dues: 0 }}
          activeTab={txFilter}
          onTabChange={handleTxTabChange}
          sortDesc={txSortDesc}
          onSortToggle={handleTxSortToggle}
          page={txPage}
          totalPages={transactionsData?.totalPages ?? 1}
          onPageChange={setTxPage}
          onMoreClick={modals.openDetailModal}
        />
        {isNotRegistered && <DuesOnboardingOverlay onStart={startDuesSetup} />}
      </div>

      <TransactionFormModal
        open={modals.addOpen}
        onOpenChange={modals.setAddOpen}
        title="거래내역 추가"
        minDate={modals.transactionMinDate}
        maxDate={modals.transactionMaxDate}
        onSubmit={modals.submitAdd}
      />
      {modals.selectedDetail && (
        <TransactionDetailModal
          open={modals.detailOpen}
          onOpenChange={modals.setDetailOpen}
          transaction={modals.selectedDetail}
          onEdit={modals.openEditModal}
          onDelete={modals.deleteSelected}
        />
      )}
      <TransactionFormModal
        open={modals.editOpen}
        onOpenChange={modals.setEditOpen}
        title="거래내역 수정"
        initialValues={modals.editingValues}
        onSubmit={modals.submitEdit}
      />
    </div>
  );
}

export { DuesPageContent };
