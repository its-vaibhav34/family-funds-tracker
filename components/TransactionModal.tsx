
import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { X, Check, Landmark, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  type: 'SPEND' | 'DEPOSIT' | 'PAPA_TOPUP';
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, account, type }) => {
  const { addTransaction } = useFund();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen || !account) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description.');
      return;
    }

    addTransaction(account.id, type, val, description);
    setAmount('');
    setDescription('');
    onClose();
  };

  const getTheme = () => {
    if (type === 'SPEND') return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: <ArrowDownCircle />, btn: 'bg-red-600' };
    if (type === 'PAPA_TOPUP') return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: <Landmark />, btn: 'bg-blue-600' };
    return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: <ArrowUpCircle />, btn: 'bg-green-600' };
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`p-8 flex items-center justify-between border-b ${theme.bg} ${theme.border}`}>
          <div className="flex items-center gap-3">
            <span className={theme.text}>{theme.icon}</span>
            <h3 className={`text-xl font-black uppercase tracking-tight ${theme.text}`}>
              {type === 'SPEND' ? 'Record Expense' : type === 'PAPA_TOPUP' ? "Papa's Top-Up" : 'General Deposit'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-white/50">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Account</span>
            <span className="text-lg font-black text-slate-900 uppercase">{account.name}</span>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Amount (INR)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-900 text-2xl font-black">₹</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-3xl font-black text-slate-900"
                placeholder="0.00"
                required
              />
            </div>
            {type === 'SPEND' && (
               <p className="text-xs font-bold text-red-400 mt-2 px-1">Limit: ₹{account.actualBalance.toLocaleString()}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-slate-900 font-medium"
              placeholder={type === 'PAPA_TOPUP' ? "Reason for reimbursement..." : "What was this for?"}
              rows={3}
              required
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl text-slate-600 font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${theme.btn} hover:brightness-110 shadow-${type === 'SPEND' ? 'red' : type === 'PAPA_TOPUP' ? 'blue' : 'green'}-100`}
            >
              <Check size={20} strokeWidth={3} /> Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
