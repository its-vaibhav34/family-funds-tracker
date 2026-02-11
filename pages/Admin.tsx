
import React, { useState, useEffect } from 'react';
import { useFund } from '../context/FundContext';
import { ShieldAlert, RefreshCcw, Landmark, CheckCircle, ShieldOff, AlertTriangle, Info } from 'lucide-react';

export default function Admin() {
  const { accounts, updateFamilyTarget, adjustActualBalance, resetAllTransactions } = useFund();
  
  // UI FEEDBACK SYSTEM
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // FORM CONTROLS
  const [familyGoal, setFamilyGoal] = useState('');
  const [targetReason, setTargetReason] = useState('');

  const [selectedAdjustAcc, setSelectedAdjustAcc] = useState('1');
  const [adjustVal, setAdjustVal] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  // HANDLERS
  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(familyGoal);
    
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (!targetReason.trim()) {
      showToast('A reason is required', 'error');
      return;
    }

    updateFamilyTarget(val, targetReason);
    setFamilyGoal('');
    setTargetReason('');
    showToast('Global Family Goal Updated!', 'success');
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(adjustVal);
    
    if (isNaN(val)) {
      showToast('Please enter a valid cash amount', 'error');
      return;
    }
    if (!adjustReason.trim()) {
      showToast('A reason is required', 'error');
      return;
    }

    adjustActualBalance(selectedAdjustAcc, val, adjustReason);
    setAdjustVal('');
    setAdjustReason('');
    showToast('Bank Balance Corrected', 'success');
  };

  const handleResetClick = () => {
    // Nuclear reset trigger
    if (window.confirm('CRITICAL ACTION: This will permanently wipe all Transaction Ledger history and Audit logs. It will reset the system to its initial baseline. Proceed?')) {
      try {
        resetAllTransactions();
        showToast('System Factory Reset Complete!', 'warning');
      } catch (err) {
        showToast('Reset failed. Try refreshing.', 'error');
      }
    }
  };

  const totalTarget = accounts.reduce((acc, curr) => acc + curr.targetBalance, 0);

  const cardClass = "bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col hover:border-blue-200 transition-all";
  const inputClass = "w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300";
  const labelClass = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1";

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-24 relative animate-in fade-in duration-500">
      
      {/* GLOBAL OVERLAY TOAST */}
      {toast && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-5 px-10 py-6 rounded-[2.5rem] shadow-[0_35px_80px_rgba(0,0,0,0.3)] border-2 animate-in slide-in-from-top-12 duration-500 ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 
          toast.type === 'warning' ? 'bg-amber-600 border-amber-400 text-white' : 
          'bg-red-600 border-red-400 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={28} /> : toast.type === 'warning' ? <AlertTriangle size={28} /> : <ShieldOff size={28} />}
          <span className="font-black uppercase tracking-tighter text-xl">{toast.message}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h2 className="text-6xl font-black text-slate-900 uppercase tracking-tighter">Admin Controls</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mt-1">Master Ledger Overrides</p>
        </div>
        <div className="bg-blue-600 text-white p-7 rounded-[2.5rem] shadow-2xl shadow-blue-200 flex flex-col items-center md:items-end">
           <span className="text-[11px] font-black uppercase opacity-75 tracking-widest">Global Baseline</span>
           <p className="text-4xl font-black tracking-tighter">₹{totalTarget.toLocaleString()}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4">
        
        {/* MANDATE SETTER */}
        <section className={cardClass}>
          <div className="p-8 bg-blue-600 text-white flex items-center gap-4 border-b-4 border-blue-700">
            <div className="p-4 bg-white/20 rounded-3xl shadow-inner"><Landmark size={32} /></div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">System Mandate</h3>
              <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">Set total family target</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdateTarget} className="p-8 space-y-8 flex-1">
            <div>
              <label className={labelClass}>New Total Cash Goal (₹)</label>
              <input 
                type="number" 
                value={familyGoal}
                onChange={(e) => setFamilyGoal(e.target.value)}
                className={inputClass}
                placeholder="e.g. 300000"
              />
            </div>
            
            <div>
              <label className={labelClass}>Mandate Change Reason</label>
              <textarea 
                value={targetReason}
                onChange={(e) => setTargetReason(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Required for audit logs..."
                rows={3}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-100 active:scale-95 transition-all text-sm"
            >
              Update Global Mandate
            </button>
          </form>
        </section>

        {/* BANK OVERRIDE */}
        <section className={cardClass}>
          <div className="p-8 bg-orange-600 text-white flex items-center gap-4 border-b-4 border-orange-700">
            <div className="p-4 bg-white/20 rounded-3xl shadow-inner"><ShieldAlert size={32} /></div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Bank Override</h3>
              <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">Fix actual discrepancies</p>
            </div>
          </div>
          
          <form onSubmit={handleAdjustBalance} className="p-8 space-y-8 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Account</label>
                <select 
                  value={selectedAdjustAcc}
                  onChange={(e) => setSelectedAdjustAcc(e.target.value)}
                  className={`${inputClass} !py-3.5`}
                >
                  <option value="1">Mummy</option>
                  <option value="2">Vaibhav</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Real Cash (₹)</label>
                <input 
                  type="number" 
                  value={adjustVal}
                  onChange={(e) => setAdjustVal(e.target.value)}
                  className={inputClass}
                  placeholder="Exact Bank State"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Adjustment Audit Reason</label>
              <textarea 
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Why are you forcing this balance?"
                rows={3}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-orange-700 shadow-2xl shadow-orange-100 active:scale-95 transition-all text-sm"
            >
              Override Bank Balance
            </button>
          </form>
        </section>

        {/* FACTORY RESET - CLEAR LOGS AND LEDGER */}
        <div className="lg:col-span-2">
          <section className="bg-slate-900 rounded-[3.5rem] p-16 text-center space-y-10 shadow-[0_40px_100px_rgba(15,23,42,0.4)] relative overflow-hidden border-4 border-slate-800">
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-8 bg-red-600 text-white rounded-full mb-10 shadow-[0_0_60px_rgba(220,38,38,0.6)] animate-pulse">
                <RefreshCcw size={64} />
              </div>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter">System Factory Reset</h3>
              <p className="text-slate-400 font-bold max-w-2xl mt-5 uppercase tracking-[0.15em] text-xs leading-loose">
                This operation will completely erase the entire Transaction Ledger and all Audit History logs. 
                Balances for Mummy and Vaibhav will be reset to match current targets immediately. 
                This action is IRREVERSIBLE.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={handleResetClick}
              className="relative z-10 px-28 py-7 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-[0.25em] text-sm hover:bg-red-50 hover:text-red-600 transition-all shadow-3xl active:scale-95 border-b-8 border-slate-300 transform"
            >
              Execute Factory Reset
            </button>
            
            {/* Background Decorative Icon */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.04] pointer-events-none transition-transform duration-1000">
               <Landmark size={800} className="absolute -top-80 -left-80 text-white rotate-12" />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
