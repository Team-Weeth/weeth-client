import type { PageResponse } from '@/types/common';

export interface DuesAccount {
  bankName: string;
  accountNumber: string;
  holderName: string;
  guide?: string;
}

export interface DuesSummary {
  accountId: number;
  accountName: string;
  cardinalNumber: number;
  duesAmount: number;
  currentBalance: number;
  isTargeted: boolean;
  paymentStatus: DuesPaymentStatus;
  isPaid: boolean;
  isAccountPublic: boolean;
  account?: DuesAccount;
  paidAmount: number;
  dueAmount: number;
  paidAt?: string;
}

export type DuesPaymentStatus = 'PAID' | 'UNPAID' | 'EXCLUDED' | 'REFUNDED';

export interface DuesCardinal {
  cardinal: number;
  name: string;
  isLatest: boolean;
}

export interface DuesMeResponse {
  accountId: number;
  cardinal: number;
  accountName: string;
  duesAmount: number;
  myPayment: {
    targeted: boolean;
    status: DuesPaymentStatus;
    dueAmount: number;
    paidAmount: number;
    paidAt: string | null;
  };
  bankAccountVisible: boolean;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    holder: string;
    guide: string;
  } | null;
  balance: {
    currentBalance: number;
    goalAmount: number;
  };
}

export interface DuesTransactionCounts {
  all: number;
  expense: number;
  income: number;
  dues: number;
}

export interface DuesTransactionSummary {
  label: string;
  totalAmount: number;
  description: string;
}

export type DuesTransactionApiFilter = 'ALL' | 'INCOME' | 'DUES' | 'EXPENSE';
export type DuesTransactionApiSort = 'LATEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC';
export type DuesTransactionApiDirection = 'INCOME' | 'EXPENSE';

export interface DuesTransactionBaseResponse {
  transactionId: number;
  type: string;
  direction: DuesTransactionApiDirection;
  title: string;
  source: string | null;
  amount: number;
  transactedAt: string;
  hasReceipt: boolean;
}

export type DuesTransactionApiItem = DuesTransactionBaseResponse;

export type DuesTransactionPage = PageResponse<DuesTransactionApiItem>;

export interface DuesTransactionsResponse {
  counts: DuesTransactionCounts;
  duesSummary: DuesTransactionSummary | null;
  transactions: DuesTransactionPage;
}

export interface DuesReceiptFile {
  fileId: number;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  status: 'UPLOADED' | 'PENDING' | 'DELETED';
}

export interface DuesTransactionDetailResponse extends DuesTransactionBaseResponse {
  category: string | null;
  registeredByName: string | null;
  memo: string | null;
  receipts: DuesReceiptFile[];
}

export type DuesTransactionType = 'income' | 'expense' | 'dues';

export interface DuesTransaction {
  id: number;
  type: DuesTransactionType;
  title: string;
  description: string;
  amount: number;
  date: string;
  counterparty?: string;
  category?: string;
  registrant?: string;
  receiptUrl?: string;
  receiptUrls?: string[];
  receiptThumbnailUrl?: string;
  receipts?: DuesReceiptFile[];
}
