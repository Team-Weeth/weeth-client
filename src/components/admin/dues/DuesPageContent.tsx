'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import type {
  MonthlyData,
  DuesTransaction,
  TransactionFilter,
  TransactionItem,
} from '@/types/admin/dues';
import { useCardinalSelector } from '@/hooks';
import { useDuesVisibilityToggle } from '@/hooks/admin';
import { isDuesNotRegisteredError, useDuesDashboardQuery } from '@/hooks/queries/admin';
import { useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { DuesPageSkeleton } from './DuesPageSkeleton';
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
import {
  useAdminDuesTransactionsQuery,
  useAdminDuesTransactionQuery,
} from '@/hooks/queries/admin/useAdminDuesQueries';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from '@/hooks/mutations/admin/useAdminDuesMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { toMonthLabel, toPeriodLabel } from '@/utils/shared/date';

// 목록 데이터 (영수증 오기 전 다른 포맷 채워놓는 용)
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

// 거래내역 상세 데이터 (영수증 데이터 포함)
function detailToTransactionDetail(detail: TransactionItem): TransactionDetail {
  return {
    type: detail.type,
    direction: detail.direction,
    amount: String(detail.amount),
    description: detail.title,
    vendor: detail.source,
    date: detail.transactedAt.slice(0, 10),
    memo: detail.memo || undefined,
    category: detail.category || undefined,
    registrant: detail.registeredByName || undefined,
    receiptUrl: detail.receipts[0]?.fileUrl,
    receipts: detail.receipts,
  };
}

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

  // 거래내역 필터/정렬/페이지 — 서버 파라미터로 전달
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

  // 잔액 부족 등 실패 메시지는 모달이 닫히기 전에 폼 내부에 인라인으로 노출하므로
  // create/update는 mutateAsync로 에러를 폼까지 전파한다(제네릭 에러 토스트는 생략).
  const { mutateAsync: createTransaction } = useCreateTransaction(
    clubId,
    dashboard?.accountId ?? null,
    { onSuccess: () => toastSuccess('거래내역이 추가되었습니다.') },
  );

  const { mutateAsync: updateTransaction } = useUpdateTransaction(
    clubId,
    dashboard?.accountId ?? null,
    { onSuccess: () => toastSuccess('거래내역이 수정되었습니다.') },
  );

  const { mutate: deleteTransaction } = useDeleteTransaction(clubId, dashboard?.accountId ?? null, {
    onSuccess: () => toastSuccess('거래내역이 삭제되었습니다.'),
    onError: () => toastError('거래내역 삭제에 실패했습니다.'),
  });

  const { isPublic, handlePublicChange } = useDuesVisibilityToggle(
    clubId,
    dashboard?.accountId ?? null,
    dashboard?.bankAccountPublic,
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

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DuesTransaction | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<TransactionFormData>>();

  // 상세 모달이 열려 있을 때만 선택된 거래의 단건 상세를 조회한
  const { data: transactionDetail } = useAdminDuesTransactionQuery(
    clubId,
    dashboard?.accountId ?? 0,
    selectedTransaction?.id ?? null,
    detailOpen,
  );

  const handleMoreClick = (tx: DuesTransaction) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  };

  const handleAddTransaction = () => {
    setAddOpen(true);
  };

  const handleAddSubmit = async (data: TransactionFormData) => {
    await createTransaction({
      type: data.type,
      amount: Number(data.amount),
      title: data.description,
      source: data.vendor,
      transactedAt: data.date,
      memo: '',
      receiptFile: data.receiptFile,
    });
  };

  const handleSetting = () => {
    router.push(`/${clubId}/admin/dues/setting`);
  };

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

  const handleEditSubmit = async (data: TransactionFormData) => {
    if (!selectedTransaction) return;
    await updateTransaction({
      transactionId: selectedTransaction.id,
      type: data.type,
      amount: Number(data.amount),
      title: data.description,
      source: data.vendor,
      transactedAt: data.date,
      memo: '',
      receiptFile: data.receiptFile,
    });
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
        onAddClick={handleAddTransaction}
        onSettingsClick={handleSetting}
      />
      <DuesGenerationFilter
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        updaterProfile={dashboard?.lastModified ?? undefined}
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

      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} onSubmit={handleAddSubmit} />
      {selectedTransaction && (
        <TransactionDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          transaction={
            transactionDetail && transactionDetail.transactionId === selectedTransaction.id
              ? detailToTransactionDetail(transactionDetail)
              : toTransactionDetail(selectedTransaction)
          }
          onEdit={handleEditOpen}
          onDelete={() => deleteTransaction(selectedTransaction.id)}
        />
      )}
      <EditTransactionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={editingValues}
        onSubmit={handleEditSubmit}
      />

      <DuesTutorialModal open={isNotRegistered} onOpenChange={() => {}} onStart={startDuesSetup} />
    </div>
  );
}

export { DuesPageContent };
