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
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
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

/** 납부 대상 벌크 처리 — 납부 정정(납부 취소 후 회비 거래 원복) */
export interface BulkUnpaidBody {
  targetIds: number[];
}

/** 납부 대상 벌크 처리 — 환불(납부 완료 대상을 환불 처리, 환불 지출 거래 생성) */
export interface BulkRefundBody {
  targetIds: number[];
  memo: string;
}

/** 납부 대상 벌크 처리 — 납부 완료(회비 수입 거래 생성) */
export interface BulkPaidBody {
  targetIds: number[];
  paidAt: string;
  memo: string;
}

/** 납부 대상 벌크 처리 — 제외(미납 대상만 가능, 납부·환불 이력이 있으면 제외 불가) */
export interface BulkExcludeBody {
  targetIds: number[];
}

/** 부원 거래 내역 공개 여부 수정 */
export interface MemberVisibilityBody {
  visible: boolean;
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

export interface LastModified {
  modifiedAt: string;
  modifiedBy: {
    userId: number;
    name: string;
    profileImageUrl: string | null;
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
  lastModified: LastModified | null;
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
export type TransactionDirection = Extract<TransactionType, 'INCOME' | 'EXPENSE'>;

/** 거래내역 필터 탭 (전체/수입/지출/회비) — 서버 filter 파라미터 값 */
export type TransactionFilter = 'ALL' | 'INCOME' | 'EXPENSE' | 'DUES';

/** 거래내역 정렬 옵션 — 서버 sort 파라미터 값 */
export type TransactionSort = 'LATEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC';

/** 거래내역 목록 조회 쿼리 파라미터 (page는 0-base) */
export interface TransactionsParams {
  filter?: TransactionFilter;
  sort?: TransactionSort;
  page?: number;
  size?: number;
}

/** 필터 탭별 거래 건수 */
export interface TransactionCounts {
  all: number;
  expense: number;
  income: number;
  dues: number;
}

export interface DuesTransaction {
  id: number;
  type: TransactionType;
  direction: TransactionDirection;
  content: string;
  counterparty: string;
  amount: number;
  balanceAfter: number;
  date: string;
  hasReceipt: boolean;
  receiptUrl?: string;
}

export interface MonthlyData {
  month: string;
  amount: number;
}

/**
 * 테이블 행에 표시되는 납부 대상의 상태.
 * - `excluded`: 납부 대상에서 제외됨(targetStatus EXCLUDED)
 * - `paid` / `unpaid` / `refunded`: 대상(TARGETED)의 납부 상태(paymentStatus)
 */
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded' | 'excluded';
export type FilterType = 'all' | PaymentStatus;

export interface DuesMember {
  id: number;
  name: string;
  major: string;
  phone: string;
  status: PaymentStatus;
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
  /** 이 거래 반영 후 러닝 밸런스(총 잔액) */
  balanceAfter: number;
  memo: string;
  hasReceipt: boolean;
  receipts: TransactionReceipt[];
  // 상세 응답에만 포함되는 필드 (목록 응답에는 없음)
  category?: string;
  registeredByName?: string;
}

export interface TransactionsInfo {
  counts: TransactionCounts;
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
