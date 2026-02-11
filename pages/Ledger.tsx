
import React, { useState, useMemo } from 'react';
import { useFund } from '../context/FundContext';
import { Search, Trash2, ArrowUpDown, Download, ReceiptText } from 'lucide-react';

export default function Ledger() {
  const { transactions, deleteTransaction, accounts } = useFund();
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAccount = accountFilter === 'ALL' || tx.accountId === accountFilter;
        const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
        return matchesSearch && matchesAccount && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, searchTerm, accountFilter, typeFilter, sortOrder]);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this transaction? Balances will re-calculate.')) {
      deleteTransaction(id);
    }
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'SPEND': return 'bg-red-100 text-red-700';
      case 'PAPA_TOPUP': return 'bg-blue-100 text-blue-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Audit Ledger</h2>
          <p className="text-slate-500 font-medium">Historical record of all transactions</p>
        </div>
        <button 
          onClick={() => alert('CSV Export Initialized...')}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={18} /> Export Data
        </button>
      </header>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-900"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="flex-1 pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 appearance-none outline-none cursor-pointer"
          >
            <option value="ALL">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 appearance-none outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="SPEND">Spends</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="PAPA_TOPUP">Papa's Top-Ups</option>
          </select>
        </div>

        <button 
          onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
        >
          <ArrowUpDown size={16} /> {sortOrder === 'DESC' ? 'Latest First' : 'Oldest First'}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap text-xs text-slate-500 font-bold">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                        {tx.accountName}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-900 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getTypeStyle(tx.type)}`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-8 py-5 whitespace-nowrap text-base font-black text-right ${
                      tx.type === 'SPEND' ? 'text-red-600' : tx.type === 'PAPA_TOPUP' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'SPEND' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                        <ReceiptText size={64} />
                      </div>
                      <p className="font-bold uppercase tracking-widest text-xs">Zero records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
