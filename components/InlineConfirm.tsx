import React from 'react';

interface InlineConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export function InlineConfirm({ message, onConfirm, onCancel, isDanger = true }: InlineConfirmProps) {
  return (
    <div className={`p-5 rounded-2xl shadow-lg border-2 animate-in fade-in zoom-in-95 duration-200 ${
      isDanger 
        ? 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/50' 
        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
    }`}>
      <h3 className={`font-black mb-2 flex items-center gap-2 ${isDanger ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        Confirmar acción
      </h3>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6">
        {message}
      </p>
      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-950 transition-all active:scale-[0.98]"
        >
          Cancelar
        </button>
        <button 
          onClick={onConfirm}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-md transition-all active:scale-[0.98] ${
            isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
