'use client';

import { useAppContext } from '@/components/AppProvider';

export default function ClientDetailControls({ id }: { id: string }) {
  const { getProgress, toggleFavorite, setStatus, isMounted } = useAppContext();
  const progress = getProgress('global');

  if (!isMounted) return null;

  const isFav = progress.favorites.includes(id);
  const status = progress.status[id] || 'new';

  return (
    <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
      <div className="flex justify-between items-center px-2">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tus Acciones</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
         <button 
          onClick={() => toggleFavorite('global', id)}
          className={`col-span-2 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl transition-all font-bold ${
            isFav 
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {isFav ? 'Favorita' : 'Marcar Favorita'}
        </button>

        <button
          onClick={() => setStatus('global', id, status === 'seen' ? 'new' : 'seen')}
          className={`col-span-1 flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl transition-all font-bold border ${
            status === 'seen'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          <span className="truncate">Vista</span>
        </button>

        <button
          onClick={() => setStatus('global', id, status === 'learned' ? 'new' : 'learned')}
           className={`col-span-1 flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl transition-all font-bold border ${
            status === 'learned'
              ? 'bg-green-500 border-green-500 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-green-300 dark:hover:border-green-700 hover:text-green-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          <span className="truncate">Aprendida</span>
        </button>
      </div>
    </div>
  );
}
