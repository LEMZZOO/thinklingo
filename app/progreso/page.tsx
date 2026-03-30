'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/components/AppProvider';
import { getAllVocabulary } from '@/lib/vocabulary';

export default function Progress() {
  const { progress, resetData, isMounted } = useAppContext();

  const allVocab = useMemo(() => getAllVocabulary(), []);
  const totalWords = allVocab.length;

  if (!isMounted) return null;

  // Calculate generic stats
  const totalFavorites = progress.favorites.length;
  const totalSeen = Object.values(progress.status).filter(s => s === 'seen' || s === 'learned').length;
  const totalLearned = Object.values(progress.status).filter(s => s === 'learned').length;

  // Quiz stats
  const { correct, incorrect, total } = progress.quizStats;
  const winRate = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleReset = (type: 'all' | 'quiz' | 'favorites' | 'status') => {
    const messages = {
      all: '¿Estás completamente seguro de borrar TODOS tus datos? Perderás favoritos, progreso y estadísticas del quiz. Esta acción no se puede deshacer.',
      quiz: '¿Borrar solo las estadísticas del Quiz?',
      favorites: '¿Borrar todas tus palabras favoritas?',
      status: '¿Borrar el progreso de palabras vistas y aprendidas?'
    };

    if (window.confirm(messages[type])) {
      resetData(type);
    }
  };

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-rose-100 dark:selection:bg-rose-900 transition-colors pb-24">
      <header className="sticky top-0 z-20 bg-gray-50/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-4 pt-6 pb-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
           <div className="bg-rose-100 dark:bg-rose-900/40 p-1.5 rounded-xl text-rose-600 dark:text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
          </div>
          Progreso
        </h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        
        {/* Global Overview */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-3">Resumen de Vocabulario</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">{totalWords}</span>
              <span className="text-xs font-bold text-gray-400">Palabras Total</span>
            </div>
            
             <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 p-4 rounded-[2rem] shadow-sm border border-amber-400/50 flex flex-col items-center justify-center text-center text-white">
              <span className="text-3xl font-black mb-1">{totalFavorites}</span>
              <span className="text-xs font-bold text-amber-100">Tus Favoritas</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{totalSeen}</span>
              <span className="text-xs font-bold text-blue-400 dark:text-blue-500">Palabras Vistas</span>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-[2rem] border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-green-600 dark:text-green-400 mb-1">{totalLearned}</span>
              <span className="text-xs font-bold text-green-500 dark:text-green-600">Aprendidas</span>
            </div>
          </div>
        </section>

        {/* Quiz Stats */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-3">Estadísticas de Quiz</h2>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700">
            
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-700 pb-5">
              <div>
                <p className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Acierto Global</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-purple-600 dark:text-purple-400 leading-none">{winRate}</span>
                  <span className="text-xl font-bold text-purple-400 dark:text-purple-500">%</span>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Respondidas</p>
                 <span className="text-2xl font-black text-gray-700 dark:text-gray-300 leading-none">{total}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Aciertos</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{correct}</span>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Fallos</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{incorrect}</span>
               </div>
            </div>

            {/* Visual Bar */}
            {total > 0 && (
              <div className="w-full h-3 flex bg-gray-100 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                <div style={{ width: `${winRate}%` }} className="h-full bg-green-500"></div>
                <div style={{ width: `${100 - winRate}%` }} className="h-full bg-red-500"></div>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-sm font-bold text-red-400 dark:text-red-500 uppercase tracking-widest pl-1 mb-3 mt-8">Zona de Peligro</h2>
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-3xl border border-red-100 dark:border-red-900/30 space-y-3">
             <button 
              onClick={() => handleReset('quiz')}
              className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-all hover:border-red-200 dark:hover:border-red-900"
            >
              Resetear Estadísticas de Quiz
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            <button 
              onClick={() => handleReset('status')}
              className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-all hover:border-red-200 dark:hover:border-red-900"
            >
              Resetear Etiquetas (Vistas / Aprendidas)
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            <button 
              onClick={() => handleReset('favorites')}
              className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-all hover:border-red-200 dark:hover:border-red-900"
            >
              Borrar Todas las Favoritas
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            <button 
              onClick={() => handleReset('all')}
              className="w-full text-left px-4 py-4 bg-red-500 text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-black shadow-sm active:scale-[0.98] transition-all hover:bg-red-600 mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              Borrar Absolutamente Todo
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
