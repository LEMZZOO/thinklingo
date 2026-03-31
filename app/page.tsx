'use client';

import Link from 'next/link';
import { getAllVocabulary } from '@/lib/vocabulary';
import { useAppContext } from '@/components/AppProvider';

export default function Home() {
  const { theme, toggleTheme, progress, isMounted } = useAppContext();
  const vocab = getAllVocabulary();

  const totalWords = vocab.length;
  const favoritesCount = progress.favorites.length;
  const seenCount = Object.values(progress.status).filter(s => s === 'seen' || s === 'learned').length;
  const learnedCount = Object.values(progress.status).filter(s => s === 'learned').length;

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto flex flex-col items-center bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
      <header className="w-full flex justify-end pt-2 pb-6">
        <button
          onClick={toggleTheme}
          className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 transition-all active:scale-95 text-gray-600 dark:text-gray-300"
          aria-label="Alternar tema"
        >
          {isMounted && theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
          )}
        </button>
      </header>

      <div className="w-full flex-1 flex flex-col justify-center">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-blue-600 dark:text-blue-400 tracking-tight">Academy Core</h1>
        <p className="text-lg text-center mb-10 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
          Aprende a pensar en inglés con el vocabulario que de verdad vas a necesitar
        </p>

        {isMounted && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 w-full mb-8 space-y-6 border border-gray-100 dark:border-slate-700 transition-colors">
            <h2 className="text-center text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tu Progreso</h2>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="text-center">
                <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100">{totalWords}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mt-1">Total</p>
              </div>
              <div className="text-center relative">
                <div className="absolute top-0 right-4 w-2 h-2 rounded-full bg-blue-500 hidden sm:block"></div>
                <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400">{seenCount}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mt-1">Vistas</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-green-500 dark:text-green-400">{learnedCount}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mt-1">Aprendidas</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-amber-500 dark:text-amber-400">{favoritesCount}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mt-1">Favoritas</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/quiz"
            className="block w-full bg-purple-600 text-white font-bold text-lg text-center py-4 rounded-xl shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:bg-purple-700 hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)] hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
            Modo Quiz
          </Link>

          <Link
            href="/flashcards"
            className="block w-full bg-indigo-600 text-white font-bold text-lg text-center py-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>
            Modo Flashcards
          </Link>

          <Link
            href="/vocabulario"
            className="block w-full bg-blue-600 text-white font-bold text-lg text-center py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="9" x2="15" y1="9" y2="9" /><line x1="9" x2="15" y1="15" y2="15" /></svg>
            Ver Lista Completa
          </Link>

          <Link
            href="/favoritos"
            className="block w-full bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 font-bold text-lg text-center py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-amber-400 group-hover:scale-110 transition-transform"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            Palabras Favoritas
          </Link>

          <Link
            href="/progreso"
            className="block w-full bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 font-bold text-lg text-center py-4 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4" /></svg>
            Ver Mis Logros
          </Link>
        </div>
      </div>
    </main>
  );
}
