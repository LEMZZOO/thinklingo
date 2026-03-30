'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isVocab = pathname?.startsWith('/vocabulario');
  const isFav = pathname?.startsWith('/favoritos');
  const isFlash = pathname?.startsWith('/flashcards');
  const isQuiz = pathname?.startsWith('/quiz');
  const isProgreso = pathname?.startsWith('/progreso');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 z-50 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center px-2 py-2">
        <Link href="/" className={`flex flex-col items-center p-1 rounded-xl transition-all ${isHome ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-300'}`}>
          <div className={`p-1.5 rounded-full ${isHome ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isHome ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isHome ? "2" : "2.5"} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className={`text-[9px] font-bold mt-1 ${isHome ? 'font-black' : ''}`}>Inicio</span>
        </Link>
        <Link href="/vocabulario" className={`flex flex-col items-center p-1 rounded-xl transition-all ${isVocab ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-300'}`}>
           <div className={`p-1.5 rounded-full ${isVocab ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isVocab ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isVocab ? "2" : "2.5"} strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
          </div>
          <span className={`text-[9px] font-bold mt-1 ${isVocab ? 'font-black' : ''}`}>Lista</span>
        </Link>
        <Link href="/flashcards" className={`flex flex-col items-center p-1 rounded-xl transition-all ${isFlash ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-300'}`}>
           <div className={`p-1.5 rounded-full ${isFlash ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isFlash ? "2" : "2.5"} strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
          </div>
          <span className={`text-[9px] font-bold mt-1 ${isFlash ? 'font-black' : ''}`}>Modo</span>
        </Link>
        <Link href="/quiz" className={`flex flex-col items-center p-1 rounded-xl transition-all ${isQuiz ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-300'}`}>
           <div className={`p-1.5 rounded-full ${isQuiz ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isQuiz ? "2" : "2.5"} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          </div>
          <span className={`text-[9px] font-bold mt-1 ${isQuiz ? 'font-black' : ''}`}>Quiz</span>
        </Link>
        <Link href="/favoritos" className={`flex flex-col items-center p-1 rounded-xl transition-all ${isFav ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-300'}`}>
          <div className={`p-1.5 rounded-full ${isFav ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFav ? "2" : "2.5"} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <span className={`text-[9px] font-bold mt-1 ${isFav ? 'font-black' : ''}`}>Favoritos</span>
        </Link>
        <Link href="/progreso" className={`flex flex-col items-center p-1 rounded-xl transition-all ${isProgreso ? 'text-rose-500 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-300'}`}>
          <div className={`p-1.5 rounded-full ${isProgreso ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isProgreso ? "2.5" : "2.5"} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
          </div>
          <span className={`text-[9px] font-bold mt-1 ${isProgreso ? 'font-black' : ''}`}>Logros</span>
        </Link>
      </div>
    </nav>
  );
}
