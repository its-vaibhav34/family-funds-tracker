
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Account, Transaction, TargetBalanceHistory, 
  ActualBalanceAdjustmentHistory, FundState, TransactionType, AccountName 
} from '../types';
import { accountAPI, transactionAPI, healthCheck, adminAPI } from '../services/api';

interface FundContextType extends FundState {
  addTransaction: (accountId: string, type: TransactionType, amount: number, description: string) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  bulkDeleteTransactions: (startDate: string, endDate: string) => void;
  resetAllTransactions: () => void;
  updateTargetBalance: (accountId: string, newTarget: number, reason: string) => void;
  updateFamilyTarget: (newTotal: number, reason: string) => void;
  adjustActualBalance: (accountId: string, newActual: number, reason: string) => void;
  getAccountById: (id: string) => Account | undefined;
  isOnline: boolean;
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

  const [isOnline, setIsOnline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check backend connectivity and load data from server
  useEffect(() => {
    const initializeData = async () => {
      try {
        const isBackendAvailable = await healthCheck();
        if (isBackendAvailable) {
          setIsOnline(true);
          // Load accounts from backend
          const accounts = await accountAPI.getAll();
          if (accounts && accounts.length > 0) {
            const mappedAccounts = accounts.map(acc => ({
              id: acc._id || acc.id || '',
              name: acc.name as AccountName,
              targetBalance: acc.targetBalance,
              actualBalance: acc.actualBalance,
              updatedAt: acc.updatedAt || new Date().toISOString(),
            }));
            
            // Load transactions from backend
            const transactions = await transactionAPI.getAll();
            const mappedTransactions = transactions.map(tx => ({
              id: tx._id || tx.id || '',
              accountId: tx.accountId,
              accountName: tx.accountName as AccountName,
              type: tx.type as TransactionType,
              amount: tx.amount,
              description: tx.description,
              createdAt: tx.createdAt || new Date().toISOString(),
            }));

            setState({
              accounts: mappedAccounts,
              transactions: mappedTransactions,
              targetHistory: [],
              adjustmentHistory: [],
            });
          }
        } else {
          setIsOnline(false);
          console.log('Backend not available, using localStorage');
        }
      } catch (error) {
        console.error('Error loading from backend:', error);
        setIsOnline(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeData();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getAccountById = useCallback((id: string) => {
    return state.accounts.find(a => a.id === id);
  }, [state.accounts]);

  const addTransaction = async (accountId: string, type: TransactionType, amount: number, description: string) => {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) throw new Error('Account not found');

    if (type === 'SPEND' && amount > account.actualBalance) {
      alert('Error: Spending cannot exceed actual bank balance.');
      throw new Error('Insufficient balance');
    }

    // Optimistic update
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

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
      accounts: prev.accounts.map(a => 
        a.id === accountId ? { ...a, actualBalance: updatedActualBalance, updatedAt: new Date().toISOString() } : a
      ),
    }));

    // Make API call
    if (isOnline) {
      try {
        const result = await transactionAPI.create({
          accountId,
          accountName: account.name,
          type,
          amount,
          description,
        });
        
        // Update the transaction with the actual MongoDB _id
        if (result.transaction && result.transaction._id) {
          setState(prev => ({
            ...prev,
            transactions: prev.transactions.map(t => 
              t.id === newTransaction.id 
                ? { ...t, id: result.transaction._id || result.transaction.id || t.id }
                : t
            ),
          }));
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
        // Revert on error
        setState(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== newTransaction.id),
          accounts: prev.accounts.map(a => 
            a.id === accountId ? { ...a, actualBalance: account.actualBalance, updatedAt: new Date().toISOString() } : a
          ),
        }));
        throw error;
      }
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    const tx = state.transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found');

    const account = state.accounts.find(a => a.id === tx.accountId);
    if (!account) throw new Error('Account not found');

    const adjustment = tx.type === 'SPEND' ? tx.amount : -tx.amount;
    const newBalance = account.actualBalance + adjustment;

    // Optimistic update
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== transactionId),
      accounts: prev.accounts.map(a => 
        a.id === tx.accountId ? { ...a, actualBalance: newBalance, updatedAt: new Date().toISOString() } : a
      ),
    }));

    // Make API call
    if (isOnline) {
      try {
        await transactionAPI.delete(transactionId);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        // Revert on error
        setState(prev => ({
          ...prev,
          transactions: [tx, ...prev.transactions],
          accounts: prev.accounts.map(a => 
            a.id === tx.accountId ? { ...a, actualBalance: account.actualBalance, updatedAt: new Date().toISOString() } : a
          ),
        }));
        throw error;
      }
    }
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

  const updateFamilyTarget = async (newTotal: number, reason: string) => {
    const mummyPortion = Math.round((newTotal * 2) / 3);
    const vaibhavPortion = newTotal - mummyPortion;

    // Optimistic update
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

    // Make API call
    if (isOnline) {
      try {
        await adminAPI.updateFamilyTargets(mummyPortion, vaibhavPortion);
        console.log('[v0] Family targets updated successfully in MongoDB');
      } catch (error) {
        console.error('Error updating family targets:', error);
      }
    }
  };

  const adjustActualBalance = async (accountId: string, newActual: number, reason: string) => {
    // Find account from current state
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) {
      console.error('[v0] Account not found with ID:', accountId);
      console.error('[v0] Available accounts:', state.accounts.map(a => ({ id: a.id, name: a.name })));
      throw new Error(`Account not found with ID: ${accountId}`);
    }

    const oldBalance = account.actualBalance;

    // Optimistic update
    setState(prev => {
      const history: ActualBalanceAdjustmentHistory = {
        id: generateId(),
        accountId,
        accountName: account.name,
        oldActualBalance: oldBalance,
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

    // Make API call to save to MongoDB
    if (isOnline) {
      try {
        console.log('[v0] Calling updateActualBalance for account:', accountId, 'Account name:', account.name, 'New balance:', newActual);
        await adminAPI.updateActualBalance(accountId, newActual);
        console.log('[v0] Actual balance updated successfully in MongoDB');
      } catch (error) {
        console.error('Error updating actual balance:', error);
        throw error;
      }
    }
  };

  const resetAllTransactions = async () => {
    // Call backend API to reset logs
    if (isOnline) {
      try {
        await adminAPI.resetAllLogs();
        console.log('[v0] All logs reset successfully in MongoDB');
      } catch (error) {
        console.error('Error resetting logs:', error);
      }
    }
    
    // Also clear localStorage and reset local state
    localStorage.removeItem(STORAGE_KEY);
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

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

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
      getAccountById,
      isOnline
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
