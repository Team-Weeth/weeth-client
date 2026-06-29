export interface DuesAccount {
  bankName: string;
  accountNumber: string;
  holderName: string;
}

export interface DuesSummary {
  cardinalNumber: number;
  duesAmount: number;
  currentBalance: number;
  targetBalance: number;
  isPaid: boolean;
  isAccountPublic: boolean;
  account?: DuesAccount;
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
  receiptThumbnailUrl?: string;
}
