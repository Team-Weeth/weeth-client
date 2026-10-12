import { useState } from 'react';

import { useAdminDuesTransactionQuery } from '@/hooks/queries/admin/useAdminDuesQueries';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from '@/hooks/mutations/admin/useAdminDuesMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { toDateInputValue } from '@/utils/shared/date';
import type { DuesTransaction, TransactionItem } from '@/types/admin/dues';
import type { TransactionDetail } from '@/components/admin/dues/modal/TransactionDetailModal';
import type { TransactionFormData } from '@/components/admin/dues/modal/TransactionForm';

// 목록 데이터 → 상세 모달용. 상세 응답 도착 전 폴백으로 사용 (현재 응답 데이터 구조상 필요함)
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

// 상세 응답 → 상세 모달용. 목록에 없는 메모·영수증 정보까지 반영
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

interface UseDuesTransactionModalsParams {
  clubId: string;
  accountId: number | null;
  /** 총 회비 등록 시작 월 (YYYY-MM). 거래 일자 최소값 계산에 사용. */
  startYearMonth?: string;
}

// 회비 거래내역의 추가·상세·수정·삭제 모달 상태와 관련 mutation을 한데 모은 훅
function useDuesTransactionModals({
  clubId,
  accountId,
  startYearMonth,
}: UseDuesTransactionModalsParams) {
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DuesTransaction | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<TransactionFormData>>();

  // 잔액 부족 등 실패 메시지는 모달이 닫히기 전에 폼 내부에 인라인으로 노출,
  // create/update는 mutateAsync로 에러를 폼까지 전달
  const { mutateAsync: createTransaction } = useCreateTransaction(clubId, accountId, {
    onSuccess: () => toastSuccess('거래내역이 추가되었습니다.'),
  });
  const { mutateAsync: updateTransaction } = useUpdateTransaction(clubId, accountId, {
    onSuccess: () => toastSuccess('거래내역이 수정되었습니다.'),
  });
  const { mutate: deleteTransaction } = useDeleteTransaction(clubId, accountId, {
    onSuccess: () => toastSuccess('거래내역이 삭제되었습니다.'),
    onError: () => toastError('거래내역 삭제에 실패했습니다.'),
  });

  // 상세 모달이 열려 있을 때만 선택된 거래의 단건 상세를 조회
  const { data: transactionDetail } = useAdminDuesTransactionQuery(
    clubId,
    accountId ?? 0,
    selectedTransaction?.id ?? null,
    detailOpen,
  );

  // 거래내역 일자 선택 범위: 총 회비 등록 시작 월(startYearMonth) 1일 ~ 오늘
  const transactionMinDate = startYearMonth ? `${startYearMonth}-01` : undefined;
  const transactionMaxDate = toDateInputValue();

  // 상세 응답이 선택된 거래와 일치하면 상세 응답을, 아니면 목록 폴백을 상세 모달에 젇날
  const selectedDetail: TransactionDetail | null = !selectedTransaction
    ? null
    : transactionDetail && transactionDetail.transactionId === selectedTransaction.id
      ? detailToTransactionDetail(transactionDetail)
      : toTransactionDetail(selectedTransaction);

  const openAddModal = () => setAddOpen(true);

  const openDetailModal = (tx: DuesTransaction) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  };

  const openEditModal = () => {
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

  const submitAdd = async (data: TransactionFormData) => {
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

  const submitEdit = async (data: TransactionFormData) => {
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

  const deleteSelected = () => {
    if (!selectedTransaction) return;
    deleteTransaction(selectedTransaction.id);
  };

  return {
    addOpen,
    setAddOpen,
    openAddModal,
    submitAdd,
    transactionMinDate,
    transactionMaxDate,
    detailOpen,
    setDetailOpen,
    openDetailModal,
    selectedDetail,
    deleteSelected,
    editOpen,
    setEditOpen,
    openEditModal,
    editingValues,
    submitEdit,
  };
}

export { useDuesTransactionModals };
