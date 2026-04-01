'use client';

import React from 'react';

interface Props {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  minFrom?: string;
  maxTo?: string;
  applyDisabled?: boolean;
  onChange: (next: { from: string; to: string }) => void;
  onApply: () => void;
}

export function AcademyAnalyticsDateRangeForm({ 
  from, 
  to, 
  minFrom, 
  maxTo, 
  applyDisabled, 
  onChange, 
  onApply 
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 w-full min-w-[140px]">
        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Desde</label>
        <input
          type="date"
          value={from}
          min={minFrom}
          max={to || maxTo}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-[var(--academy-primary)] outline-none transition-all"
        />
      </div>
      <div className="flex-1 w-full min-w-[140px]">
        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Hasta</label>
        <input
          type="date"
          value={to}
          min={from || minFrom}
          max={maxTo}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-[var(--academy-primary)] outline-none transition-all"
        />
      </div>
      <button
        type="button"
        onClick={onApply}
        disabled={applyDisabled || !from || !to}
        className="h-11 w-full sm:w-auto px-6 bg-[var(--academy-primary)] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[var(--academy-primary)]/10 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
      >
        Aplicar
      </button>
    </div>
  );
}
