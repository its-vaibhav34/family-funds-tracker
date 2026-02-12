const API_BASE_URL = 'http://localhost:10000/api';

export interface Account {
  _id?: string;
  id?: string;
  name: string;
  targetBalance: number;
  actualBalance: number;
  updatedAt?: string;
}

export interface Transaction {
  _id?: string;
  id?: string;
  accountId: string;
  accountName: string;
  type: 'SPEND' | 'DEPOSIT' | 'PAPA_TOPUP';
  amount: number;
  description: string;
  createdAt?: string;
}

// Account APIs
export const accountAPI = {
  getAll: async (): Promise<Account[]> => {
    const response = await fetch(`${API_BASE_URL}/funds`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const data = await response.json();
    return data.data || [];
  },

  getById: async (id: string): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/funds/${id}`);
    if (!response.ok) throw new Error('Failed to fetch account');
    const data = await response.json();
    return data.data;
  },

  create: async (account: Omit<Account, '_id' | 'id'>): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    if (!response.ok) throw new Error('Failed to create account');
    const data = await response.json();
    return data.data;
  },

  update: async (id: string, account: Partial<Account>): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/funds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    if (!response.ok) throw new Error('Failed to update account');
    const data = await response.json();
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/funds/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete account');
  },
};

// Transaction APIs
export const transactionAPI = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const data = await response.json();
    return data.data || [];
  },

  getByAccountId: async (accountId: string): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions/account/${accountId}`);
    if (!response.ok) throw new Error('Failed to fetch account transactions');
    const data = await response.json();
    return data.data || [];
  },

  create: async (transaction: Omit<Transaction, '_id' | 'id'>): Promise<{ transaction: Transaction; account: Account }> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create transaction');
    }
    const data = await response.json();
    return { transaction: data.data, account: data.account };
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  },
};

// Admin APIs - for master ledger overrides
export const adminAPI = {
  updateFamilyTargets: async (mummyTarget: number, vaibhavTarget: number): Promise<Account[]> => {
    const response = await fetch(`${API_BASE_URL}/funds/family-targets/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mummyTarget, vaibhavTarget }),
    });
    if (!response.ok) throw new Error('Failed to update family targets');
    const data = await response.json();
    console.log('[v0] Family targets API response:', data);
    return data.accounts || [];
  },

  updateActualBalance: async (accountId: string, newActual: number): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/funds/${accountId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newActual }),
    });
    if (!response.ok) throw new Error('Failed to update actual balance');
    const data = await response.json();
    console.log('[v0] Actual balance API response:', data);
    return data.data;
  },

  resetAllLogs: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/funds/reset-logs`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset logs');
    const data = await response.json();
    console.log('[v0] Reset logs API response:', data);
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
