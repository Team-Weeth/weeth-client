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
