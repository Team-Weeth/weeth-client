'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import type { MonthlyData, DuesTransaction, TransactionFilter } from '@/types/admin/dues';
import { useCardinalSelector } from '@/hooks';
import { isDuesNotRegisteredError, useDuesDashboardQuery } from '@/hooks/queries/admin';
import { useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { DuesTopBar } from './DuesTopBar';
import { DuesBalanceCard } from './DuesBalanceCard';
import { DuesChart } from './DuesChart';

import { DuesGenerationFilter } from './DuesGenerationFilter';
import { AddTransactionModal } from './modal/AddTransactionModal';
import { EditTransactionModal } from './modal/EditTransactionModal';
import { TransactionDetailModal } from './modal/TransactionDetailModal';
import type { TransactionDetail } from './modal/TransactionDetailModal';
import type { TransactionFormData } from './modal/TransactionForm';
import { DuesTransactionTable } from './DuesTransactionTable';
import { DuesTutorialModal } from './modal/DuesTutorialModal';
import { useAdminDuesTransactionsQuery } from '@/hooks/queries/admin/useAdminDuesQueries';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateMemberVisibility,
  useUpdateTransaction,
} from '@/hooks/mutations/admin/useAdminDuesMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';

// 'YYYY-MM' → 'N월'
function toMonthLabel(yearMonth: string): string {
  return `${Number(yearMonth.split('-')[1])}월`;
}

// 'YYYY-MM' → 'YYYY.MM.'
function toPeriodLabel(yearMonth: string | undefined): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  return `${year}.${month}.`;
}

function toTransactionDetail(tx: DuesTransaction): TransactionDetail {
  return {
    type: tx.type,
    direction: tx.direction,
    amount: String(tx.amount),
    description: tx.content,
    vendor: tx.counterparty,
    date: tx.date,
    receiptUrl: tx.receiptUrl,
  };
}

function DuesPageContent() {
  // TODO: 대시보드 응답에 부원 공개 여부(member-visibility) 필드 추가 요청함(백엔드 대기 중).
  // 추가되면 useState(true) 기본값 대신 dashboard 값으로 초기화할 것.
  const [isPublic, setIsPublic] = useState(true);
  const [activeMonth, setActiveMonth] = useState('');
  const { cardinals, setSelectedCardinalId, activeCardinal } = useCardinalSelector({
    autoSelectLatest: true,
  });
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { reset, setField } = useDuesSetupActions();

  // 회비 대시보드 조회. 등록이 완료되지 않은 장부(20112)면 온보딩 튜토리얼 모달을 띄운다.
  const { data: dashboard, error: dashboardError } = useDuesDashboardQuery(
    clubId,
    activeCardinal?.cardinalNumber ?? null,
  );
  const isNotRegistered = isDuesNotRegisteredError(dashboardError);

  // 거래내역 필터/정렬/페이지 — 서버 파라미터로 전달 (page는 UI 1-base → API 0-base 변환)
  const [txFilter, setTxFilter] = useState<TransactionFilter>('ALL');
  const [txSortDesc, setTxSortDesc] = useState(true);
  const [txPage, setTxPage] = useState(1);

  const { data: transactionsData } = useAdminDuesTransactionsQuery(
    clubId,
    dashboard?.accountId ?? 0,
    {
      filter: txFilter,
      sort: txSortDesc ? 'LATEST' : 'OLDEST',
      page: txPage - 1,
      size: 10,
    },
  );

  const handleTxTabChange = (tab: TransactionFilter) => {
    setTxFilter(tab);
    setTxPage(1);
  };

  const handleTxSortToggle = () => {
    setTxSortDesc((prev) => !prev);
    setTxPage(1);
  };

  const { mutate: createTransaction } = useCreateTransaction(clubId, dashboard?.accountId ?? null, {
    onSuccess: () => toastSuccess('거래내역이 추가되었습니다.'),
    onError: () => toastError('거래내역 추가에 실패했습니다.'),
  });

  const { mutate: updateTransaction } = useUpdateTransaction(clubId, dashboard?.accountId ?? null, {
    onSuccess: () => toastSuccess('거래내역이 수정되었습니다.'),
    onError: () => toastError('거래내역 수정에 실패했습니다.'),
  });

  const { mutate: deleteTransaction } = useDeleteTransaction(clubId, dashboard?.accountId ?? null, {
    onSuccess: () => toastSuccess('거래내역이 삭제되었습니다.'),
    onError: () => toastError('거래내역 삭제에 실패했습니다.'),
  });

  const { mutate: updateMemberVisibility } = useUpdateMemberVisibility(
    clubId,
    dashboard?.accountId ?? null,
    {
      onError: () => toastError('공개 설정 변경에 실패했습니다.'),
    },
  );

  // 낙관적 업데이트: 스위치는 즉시 반영하고, 실패 시 이전 값으로 되돌린다.
  const handlePublicChange = (value: boolean) => {
    setIsPublic(value);
    updateMemberVisibility(value, {
      onError: () => setIsPublic(!value),
    });
  };

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

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DuesTransaction | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<TransactionFormData>>();

  const handleMoreClick = (tx: DuesTransaction) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  };

  const handleAddTransaction = () => {
    setAddOpen(true);
  };

  const handleSetting = () => {};

  const handleEditOpen = () => {
    if (!selectedTransaction) return;
    setDetailOpen(false);
    setEditingValues({
      type: selectedTransaction.direction === 'EXPENSE' ? 'EXPENSE' : 'INCOME',
      amount: String(selectedTransaction.amount),
      description: selectedTransaction.content,
      vendor: selectedTransaction.counterparty,
      date: selectedTransaction.date,
    });
    setEditOpen(true);
  };

  return (
    <div className="tablet:p-700 flex min-w-85 flex-col gap-400 p-400">
      <DuesTopBar
        isPublic={isPublic}
        onPublicChange={handlePublicChange}
        onAddClick={handleAddTransaction}
        onSettingsClick={handleSetting}
      />
      <DuesGenerationFilter
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        lastUpdated={dashboard?.lastModified?.modifiedAt ?? ''}
        updaterProfileImage={dashboard?.lastModified?.modifiedBy.profileImageUrl ?? undefined}
        onSelect={setSelectedCardinalId}
      />
      <div className="tablet:flex-row flex flex-col gap-1">
        <DuesBalanceCard
          currentBalance={dashboard?.summary.currentBalance ?? 0}
          totalDues={dashboard?.summary.totalAmount ?? 0}
          paidCount={dashboard?.paymentSummary.paidCount ?? 0}
          totalCount={dashboard?.paymentSummary.totalTargetCount ?? 0}
          bankName={dashboard?.bankAccount?.bankName ?? ''}
          accountNumber={dashboard?.bankAccount?.accountNumber ?? ''}
          holderName={dashboard?.bankAccount?.holder ?? ''}
          isAccountPublic={dashboard?.bankAccountPublic ?? false}
          onViewPaymentDetail={() => router.push(`/${clubId}/admin/dues/payment-status`)}
          onAddTransaction={handleAddTransaction}
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
        onMoreClick={handleMoreClick}
      />

      <AddTransactionModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => {
          createTransaction({
            type: data.type,
            amount: Number(data.amount),
            title: data.description,
            source: data.vendor,
            transactedAt: data.date,
            memo: '',
            receiptFile: data.receiptFile,
          });
        }}
      />
      {selectedTransaction && (
        <TransactionDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          transaction={toTransactionDetail(selectedTransaction)}
          onEdit={handleEditOpen}
          onDelete={() => deleteTransaction(selectedTransaction.id)}
        />
      )}
      <EditTransactionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={editingValues}
        onSubmit={(data) => {
          if (!selectedTransaction) return;
          updateTransaction({
            transactionId: selectedTransaction.id,
            type: data.type,
            amount: Number(data.amount),
            title: data.description,
            source: data.vendor,
            transactedAt: data.date,
            memo: '',
            receiptFile: data.receiptFile,
          });
        }}
      />
      {/* 등록 미완료 장부(20112): 온보딩 완료 전까지 닫히지 않도록 고정 표시 */}
      <DuesTutorialModal open={isNotRegistered} onOpenChange={() => {}} onStart={startDuesSetup} />
    </div>
  );
}

export { DuesPageContent };
