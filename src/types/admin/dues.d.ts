import { TransactionDirection } from './dues.d';
export interface DuesDraftData {
  accountId: number;
  isNew: boolean;
  lastModifiedByName: string | null;
}

export type RegistrationStep =
  | 'BASIC'
  | 'PAYMENT_TARGET'
  | 'CARRY_OVER'
  | 'BANK_ACCOUNT'
  | 'REVIEW';

export interface RegistrationStatus {
  accountId: number;
  registrationStep: RegistrationStep;
  basic: {
    name: string;
    duesAmount: number;
    description: string | null;
  } | null;
  carryOver: {
    enabled: boolean;
    amount: number;
    memo: string | null;
  } | null;
  paymentTargets: {
    targetCount: number;
    excludedCount: number;
  } | null;
  bankAccount: {
    bankAccountVisible: boolean;
    bankAccount: {
      bankName: string;
      accountNumber: string;
      holder: string;
      guide: string | null;
    } | null;
  } | null;
  previousAccountBalance: {
    cardinalNumber: number;
    balance: number;
  } | null;
}

export interface SaveBasicBody {
  name: string;
  duesAmount: number;
  description: string;
}

export interface PaymentTargetInfo {
  userId: number;
  clubMemberId: number;
  name: string;
  tel: string;
  school: string;
  department: string;
  memberRole: 'LEAD' | 'ADMIN' | 'USER';
  memberStatus: 'ACTIVE' | 'INACTIVE';
  profileImageUrl: string | null;
}

export interface PaymentTarget {
  targetId: number;
  paymentTargetInfo: PaymentTargetInfo;
  targetStatus: 'TARGETED' | 'EXCLUDED';
  paymentStatus: 'UNPAID' | 'PAID' | 'CONFIRMED';
  dueAmount: number;
  paidAmount: number;
  paidAt: string | null;
  confirmedBy: number | null;
  memo: string | null;
}

export interface SaveCarryOverBody {
  enabled: boolean;
  amount: number;
  memo: string;
}

export interface CarryOverSource {
  hasPreviousAccount: boolean;
  cardinalNumber: number;
  balance: number;
}

export interface SavePaymentTargetsBody {
  targetedClubMemberIds: number[];
}

export interface SaveBankAccountBody {
  bankAccountVisible: boolean;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    holder: string;
    guide: string | null;
  };
}

export interface PaymentTargetsData {
  summary: {
    totalCount: number;
    targetedCount: number;
    excludedCount: number;
  };
  targets: {
    content: PaymentTarget[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface DuesDashboard {
  accountId: number;
  summary: {
    totalAmount: number;
    currentBalance: number;
  };
  paymentSummary: {
    paidCount: number;
    totalTargetCount: number;
  };
  bankAccountPublic: boolean;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    holder: string;
    guide: string | null;
  } | null;
  lastModified: {
    modifiedAt: string;
    modifiedBy: {
      userId: number;
      name: string;
      profileImageUrl: string | null;
    };
  } | null;
  period: {
    startYearMonth: string;
    endYearMonth: string;
  };
  monthlyBalances: {
    yearMonth: string;
    income: number;
    expense: number;
    endingBalance: number;
  }[];
}

export type TransactionType = 'CARRY_OVER' | 'DUES' | 'INCOME' | 'EXPENSE' | 'REFUND';

/** 금액 부호/색상 판별용 방향 (수입/지출) */
export type TransactionDirection = 'INCOME' | 'EXPENSE';

export interface DuesTransaction {
  id: number;
  type: TransactionType;
  direction: TransactionDirection;
  content: string;
  counterparty: string;
  amount: number;
  totalBalance: number;
  date: string;
  hasReceipt: boolean;
  receiptUrl?: string;
}

export interface MonthlyData {
  month: string;
  amount: number;
}

export type PaymentStatus = 'paid' | 'unpaid';
export type FilterType = 'all' | 'paid' | 'unpaid';

export interface DuesMember {
  id: number;
  name: string;
  major: string;
  phone: string;
  status: PaymentStatus;
  avatarInitial?: string;
}

export interface TransactionReceipt {
  fileId: number;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  status: 'UPLOADED' | 'DELETED';
}

export interface TransactionItem {
  transactionId: number;
  type: TransactionType;
  direction: TransactionDirection;
  title: string;
  source: string;
  amount: number;
  transactedAt: string;
  memo: string;
  hasReceipt: number;
  receipts: TransactionReceipt[];
}

export interface TransactionsInfo {
  counts: {
    all: number;
    expense: number;
    income: number;
    dues: number;
  };
  transactions: {
    content: TransactionItem[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface TransactionFileBody {
  fileName: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
}

export interface TransactionBody {
  type: TransactionDirection;
  amount: number;
  title: string;
  source: string;
  transactedAt: string;
  memo: string;
  files: TransactionFileBody[];
}
