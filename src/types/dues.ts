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
