
import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { IndianRupee, TrendingUp, AlertCircle, Plus, Minus, Landmark, ShieldCheck } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';

const SummaryCard = ({ title, amount, icon: Icon, colorClass, subtitle }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={`p-2 rounded-xl ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">₹{amount.toLocaleString()}</h3>
      {subtitle && <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">{subtitle}</p>}
    </div>
  </div>
);

const AccountCard = ({ account, onAction, unreimbursedSpending }: any) => {
  // Shortfall is based only on unreimbursed spending, not mandate changes
  const pending = unreimbursedSpending;
  
  return (
    <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-xl flex flex-col transition-all hover:border-blue-200">
      <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{account.name}</h4>
        {pending <= 0 ? (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={12} /> Full Balance
          </span>
        ) : (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            Pending Fill
          </span>
        )}
      </div>
      
      <div className="p-8 space-y-8">
        <div>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Current Bank Balance</span>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{account.actualBalance.toLocaleString()}</p>
        </div>

        <div className={`p-5 rounded-2xl border-2 ${pending > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${pending > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {pending > 0 ? "Shortfall to be reimbursed" : "Surplus Amount"}
          </span>
          <p className={`text-2xl font-black ${pending > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹{Math.abs(pending).toLocaleString()}
          </p>
        </div>

        {/* Buttons are always solid and visible */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => onAction(account, 'SPEND')}
            className="flex items-center justify-center gap-2 bg-slate-100 border-2 border-slate-200 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 shadow-sm"
          >
            <Minus size={16} strokeWidth={4} /> Spend
          </button>
          <button 
            onClick={() => onAction(account, 'DEPOSIT')}
            className="flex items-center justify-center gap-2 bg-slate-100 border-2 border-slate-200 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={16} strokeWidth={4} /> Deposit
          </button>
        </div>
        
        <button 
          onClick={() => onAction(account, 'PAPA_TOPUP')}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 border-2 border-blue-600 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95 shadow-blue-100"
        >
          <Landmark size={16} strokeWidth={3} /> Papa's Top-Up
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { accounts, transactions } = useFund();
  const [modalState, setModalState] = useState<{ isOpen: boolean; account: any; type: any }>({
    isOpen: false,
    account: null,
    type: 'SPEND'
  });

  // Calculate unreimbursed spending for each account
  const getUnreimbursedSpending = (accountId: string) => {
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    const totalSpent = accountTransactions
      .filter(t => t.type === 'SPEND')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalTopups = accountTransactions
      .filter(t => t.type === 'PAPA_TOPUP')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalSpent - totalTopups;
  };

  const totalTarget = accounts.reduce((acc, curr) => acc + curr.targetBalance, 0);
  const totalActual = accounts.reduce((acc, curr) => acc + curr.actualBalance, 0);
  // Total shortfall is sum of unreimbursed spending from all accounts
  const totalPending = accounts.reduce((sum, acc) => sum + Math.max(0, getUnreimbursedSpending(acc.id)), 0);

  const handleAction = (account: any, type: any) => {
    setModalState({ isOpen: true, account, type });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Family Fund</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Father's Maintenance Ledger</p>
        </div>
        <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex flex-col items-center md:items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total System Goal</span>
          <h3 className="text-3xl font-black tracking-tighter">₹{totalTarget.toLocaleString()}</h3>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Family Goal" 
          amount={totalTarget} 
          icon={Landmark} 
          colorClass="bg-blue-600 text-white" 
          subtitle="Overall Mandate"
        />
        <SummaryCard 
          title="Total Cash Available" 
          amount={totalActual} 
          icon={TrendingUp} 
          colorClass="bg-emerald-500 text-white"
          subtitle="Real Bank Total"
        />
        <SummaryCard 
          title="Family Shortfall" 
          amount={totalPending > 0 ? totalPending : 0} 
          icon={AlertCircle} 
          colorClass={totalPending > 0 ? "bg-red-500 text-white" : "bg-emerald-100 text-emerald-700"}
          subtitle={totalPending > 0 ? "Pending from Papa" : "Fully Maintained"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {accounts.map(acc => (
          <AccountCard 
            key={acc.id} 
            account={acc} 
            onAction={handleAction} 
            unreimbursedSpending={getUnreimbursedSpending(acc.id)}
          />
        ))}
      </div>

      <div className="bg-white border-2 border-slate-100 p-10 rounded-[3rem] shadow-sm">
        <div className="max-w-3xl">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Usecase Summary</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your father gave <span className="text-slate-900 font-black">₹{totalTarget.toLocaleString()}</span> to maintain. 
            When you spend (like your ₹4k or Mummy's ₹3k), the shortfall increases. 
            The "Family Shortfall" tells you exactly what to ask from Papa. 
            Once he gives you the top-up (like that ₹10k), record it to bring the balances back to the original mandated amounts.
          </p>
        </div>
      </div>

      <TransactionModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ ...modalState, isOpen: false })} 
        account={modalState.account}
        type={modalState.type}
      />
    </div>
  );
}
