
import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { History as HistoryIcon, ArrowRight, ShieldCheck, Target } from 'lucide-react';

export default function History() {
  const { targetHistory, adjustmentHistory } = useFund();
  const [activeTab, setActiveTab] = useState<'TARGET' | 'ADJUSTMENT'>('TARGET');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Audit History</h2>
        <p className="text-slate-500">Immutable trail of balance and target modifications</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-slate-200 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('TARGET')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'TARGET' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Target Balance History
        </button>
        <button 
          onClick={() => setActiveTab('ADJUSTMENT')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'ADJUSTMENT' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manual Overrides
        </button>
      </div>

      {activeTab === 'TARGET' ? (
        <div className="space-y-4">
          {targetHistory.length > 0 ? (
            targetHistory.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Target size={24} /></div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.accountName}</h4>
                    <p className="text-xs text-slate-500">{new Date(item.changedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                   <div className="text-right">
                     <span className="block text-[10px] text-slate-400 font-bold uppercase">Old</span>
                     <span className="font-semibold text-slate-600">₹{item.oldTargetBalance.toLocaleString()}</span>
                   </div>
                   <ArrowRight size={16} className="text-slate-300" />
                   <div>
                     <span className="block text-[10px] text-slate-400 font-bold uppercase">New</span>
                     <span className="font-bold text-blue-600">₹{item.newTargetBalance.toLocaleString()}</span>
                   </div>
                </div>
                <div className="flex-1 md:max-w-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Reason</span>
                  <p className="text-sm text-slate-600 italic">"{item.reason}"</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              <HistoryIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>No target balance changes recorded yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {adjustmentHistory.length > 0 ? (
            adjustmentHistory.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ShieldCheck size={24} /></div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.accountName}</h4>
                    <p className="text-xs text-slate-500">{new Date(item.adjustedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                   <div className="text-right">
                     <span className="block text-[10px] text-slate-400 font-bold uppercase">From</span>
                     <span className="font-semibold text-slate-600">₹{item.oldActualBalance.toLocaleString()}</span>
                   </div>
                   <ArrowRight size={16} className="text-slate-300" />
                   <div>
                     <span className="block text-[10px] text-slate-400 font-bold uppercase">To</span>
                     <span className="font-bold text-orange-600">₹{item.newActualBalance.toLocaleString()}</span>
                   </div>
                </div>
                <div className="flex-1 md:max-w-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Correction Reason</span>
                  <p className="text-sm text-slate-600 italic">"{item.adjustmentReason}"</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
              <p>No manual actual balance adjustments recorded.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
