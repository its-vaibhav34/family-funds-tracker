
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Account, Transaction, TargetBalanceHistory, 
  ActualBalanceAdjustmentHistory, FundState, TransactionType, AccountName 
} from '../types';

interface FundContextType extends FundState {
  addTransaction: (accountId: string, type: TransactionType, amount: number, description: string) => void;
  deleteTransaction: (transactionId: string) => void;
  bulkDeleteTransactions: (startDate: string, endDate: string) => void;
  resetAllTransactions: () => void;
  updateTargetBalance: (accountId: string, newTarget: number, reason: string) => void;
  updateFamilyTarget: (newTotal: number, reason: string) => void;
  adjustActualBalance: (accountId: string, newActual: number, reason: string) => void;
  getAccountById: (id: string) => Account | undefined;
}

const FundContext = createContext<FundContextType | undefined>(undefined);

const STORAGE_KEY = 'family_fund_data_v7';
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const INITIAL_ACCOUNTS = (): Account[] => [
  { id: '1', name: 'Mummy', targetBalance: 200000, actualBalance: 200000, updatedAt: new Date().toISOString() },
  { id: '2', name: 'Vaibhav', targetBalance: 100000, actualBalance: 100000, updatedAt: new Date().toISOString() },
];

export const FundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FundState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation of parsed data
        if (parsed && Array.isArray(parsed.accounts)) return parsed;
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
    return {
      accounts: INITIAL_ACCOUNTS(),
      transactions: [],
      targetHistory: [],
      adjustmentHistory: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getAccountById = useCallback((id: string) => {
    return state.accounts.find(a => a.id === id);
  }, [state.accounts]);

  const addTransaction = (accountId: string, type: TransactionType, amount: number, description: string) => {
    setState(prev => {
      const account = prev.accounts.find(a => a.id === accountId);
      if (!account) return prev;

      if (type === 'SPEND' && amount > account.actualBalance) {
        alert('Error: Spending cannot exceed actual bank balance.');
        return prev;
      }

      const newTransaction: Transaction = {
        id: generateId(),
        accountId,
        accountName: account.name,
        type,
        amount,
        description,
        createdAt: new Date().toISOString(),
      };

      const updatedActualBalance = type === 'SPEND' 
        ? account.actualBalance - amount 
        : account.actualBalance + amount;

      return {
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
        accounts: prev.accounts.map(a => 
          a.id === accountId ? { ...a, actualBalance: updatedActualBalance, updatedAt: new Date().toISOString() } : a
        ),
      };
    });
  };

  const deleteTransaction = (transactionId: string) => {
    setState(prev => {
      const tx = prev.transactions.find(t => t.id === transactionId);
      if (!tx) return prev;
      const account = prev.accounts.find(a => a.id === tx.accountId);
      if (!account) return prev;

      const adjustment = tx.type === 'SPEND' ? tx.amount : -tx.amount;
      const newBalance = account.actualBalance + adjustment;

      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== transactionId),
        accounts: prev.accounts.map(a => 
          a.id === tx.accountId ? { ...a, actualBalance: newBalance, updatedAt: new Date().toISOString() } : a
        ),
      };
    });
  };

  const updateTargetBalance = (accountId: string, newTarget: number, reason: string) => {
    setState(prev => {
      const account = prev.accounts.find(a => a.id === accountId);
      if (!account) return prev;

      const history: TargetBalanceHistory = {
        id: generateId(),
        accountId,
        accountName: account.name,
        oldTargetBalance: account.targetBalance,
        newTargetBalance: newTarget,
        changeAmount: newTarget - account.targetBalance,
        reason,
        changedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        targetHistory: [history, ...prev.targetHistory],
        accounts: prev.accounts.map(a => 
          a.id === accountId ? { ...a, targetBalance: newTarget, updatedAt: new Date().toISOString() } : a
        ),
      };
    });
  };

  const updateFamilyTarget = (newTotal: number, reason: string) => {
    const mummyPortion = Math.round((newTotal * 2) / 3);
    const vaibhavPortion = newTotal - mummyPortion;

    setState(prev => {
      const histories: TargetBalanceHistory[] = [];
      const updatedAccounts = prev.accounts.map(a => {
        const oldTarget = a.targetBalance;
        const newTarget = a.name === 'Mummy' ? mummyPortion : vaibhavPortion;
        
        histories.push({
          id: generateId(),
          accountId: a.id,
          accountName: a.name,
          oldTargetBalance: oldTarget,
          newTargetBalance: newTarget,
          changeAmount: newTarget - oldTarget,
          reason: `[Global Update] ${reason}`,
          changedAt: new Date().toISOString(),
        });

        return { ...a, targetBalance: newTarget, updatedAt: new Date().toISOString() };
      });

      return {
        ...prev,
        targetHistory: [...histories, ...prev.targetHistory],
        accounts: updatedAccounts
      };
    });
  };

  const adjustActualBalance = (accountId: string, newActual: number, reason: string) => {
    setState(prev => {
      const account = prev.accounts.find(a => a.id === accountId);
      if (!account) return prev;

      const history: ActualBalanceAdjustmentHistory = {
        id: generateId(),
        accountId,
        accountName: account.name,
        oldActualBalance: account.actualBalance,
        newActualBalance: newActual,
        adjustmentReason: reason,
        adjustedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        adjustmentHistory: [history, ...prev.adjustmentHistory],
        accounts: prev.accounts.map(a => 
          a.id === accountId ? { ...a, actualBalance: newActual, updatedAt: new Date().toISOString() } : a
        ),
      };
    });
  };

  const resetAllTransactions = () => {
    // Immediate local storage purge
    localStorage.removeItem(STORAGE_KEY);
    
    // Nuclear state reset
    setState({
      accounts: INITIAL_ACCOUNTS(),
      transactions: [],
      targetHistory: [],
      adjustmentHistory: [],
    });
  };

  const bulkDeleteTransactions = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    setState(prev => {
      const toDelete = prev.transactions.filter(t => {
        const date = new Date(t.createdAt);
        return date >= start && date <= end;
      });

      if (toDelete.length === 0) return prev;

      const newAccounts = [...prev.accounts];
      toDelete.forEach(tx => {
        const accIdx = newAccounts.findIndex(a => a.id === tx.accountId);
        if (accIdx !== -1) {
          const adjustment = tx.type === 'SPEND' ? tx.amount : -tx.amount;
          newAccounts[accIdx] = {
            ...newAccounts[accIdx],
            actualBalance: newAccounts[accIdx].actualBalance + adjustment,
            updatedAt: new Date().toISOString()
          };
        }
      });

      return {
        ...prev,
        transactions: prev.transactions.filter(t => !toDelete.some(td => td.id === t.id)),
        accounts: newAccounts
      };
    });
  };

  return (
    <FundContext.Provider value={{ 
      ...state, 
      addTransaction, 
      deleteTransaction, 
      bulkDeleteTransactions,
      resetAllTransactions,
      updateTargetBalance, 
      updateFamilyTarget,
      adjustActualBalance, 
      getAccountById 
    }}>
      {children}
    </FundContext.Provider>
  );
};

export const useFund = () => {
  const context = useContext(FundContext);
  if (!context) throw new Error('useFund must be used within a FundProvider');
  return context;
};
