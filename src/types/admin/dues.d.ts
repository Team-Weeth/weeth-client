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
