export interface DuesDraftData {
  accountId: number;
  isNew: boolean;
  lastModifiedByName: string | null;
}

export type RegistrationStep = 'BASIC' | 'PAYMENT_TARGET' | 'CARRY_OVER' | 'BANK_ACCOUNT';

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

export type TransactionType = 'income' | 'expense' | 'dues';

export interface DuesTransaction {
  id: number;
  type: TransactionType;
  content: string;
  counterparty: string;
  amount: number;
  totalBalance: number;
  date: string;
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
