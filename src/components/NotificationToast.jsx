import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const NotificationToast = () => {
  const { activeToast } = useApp();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="max-w-sm bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-slate-800 shrink-0 text-emerald-400">
          {activeToast.type === 'booking' || activeToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : activeToast.type === 'alert' || activeToast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <Info className="w-5 h-5 text-slate-300" />
          )}
        </div>

        <div className="flex-1 space-y-0.5">
          <h4 className="text-xs font-bold text-white tracking-tight">{activeToast.title}</h4>
          <p className="text-[11px] leading-relaxed text-slate-300">{activeToast.message}</p>
        </div>
      </div>
    </div>
  );
};

