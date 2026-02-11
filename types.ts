
export type AccountName = 'Mummy' | 'Vaibhav';

export interface Account {
  id: string;
  name: AccountName;
  targetBalance: number; // Papa's Mandated Balance
  actualBalance: number;
  updatedAt: string;
}

export type TransactionType = 'SPEND' | 'DEPOSIT' | 'PAPA_TOPUP';

export interface Transaction {
  id: string;
  accountId: string;
  accountName: AccountName;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface TargetBalanceHistory {
  id: string;
  accountId: string;
  accountName: AccountName;
  oldTargetBalance: number;
  newTargetBalance: number;
  changeAmount: number;
  reason: string;
  changedAt: string;
}

export interface ActualBalanceAdjustmentHistory {
  id: string;
  accountId: string;
  accountName: AccountName;
  oldActualBalance: number;
  newActualBalance: number;
  adjustmentReason: string;
  adjustedAt: string;
}

export interface FundState {
  accounts: Account[];
  transactions: Transaction[];
  targetHistory: TargetBalanceHistory[];
  adjustmentHistory: ActualBalanceAdjustmentHistory[];
}
