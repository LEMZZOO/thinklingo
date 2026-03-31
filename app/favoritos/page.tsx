'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllVocabulary } from '@/lib/vocabulary';
import { useAppContext } from '@/components/AppProvider';

export default function FavoritosList() {
  const { getProgress, toggleFavorite, isMounted } = useAppContext();
  const progress = getProgress('global');
  const [search, setSearch] = useState('');

  const vocab = getAllVocabulary();
  
  const favItems = vocab.filter(v => progress.favorites.includes(v.id));

  const filtered = favItems.filter(entry => {
    const normSearch = search.toLowerCase().trim();
    if (!normSearch) return true;
    return (
      entry.english_word.toLowerCase().includes(normSearch) ||
      entry.spanish_translation.toLowerCase().includes(normSearch)
    );
  });

  return (
    <main className="min-h-screen max-w-md mx-auto bg-gray-50/50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-amber-100 dark:selection:bg-amber-900 transition-colors">
      <header className="sticky top-0 z-20 bg-gray-50/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-4 pt-6 pb-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400 drop-shadow-sm" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Favoritos
        </h1>

        {isMounted && favItems.length > 0 && (
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-amber-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Buscar en favoritos..." 
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
             {search && (
              <button onClick={() => setSearch('')} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
        )}
      </header>

      {isMounted && (
        <div className="p-4 space-y-3">
          {filtered.map(v => {
            const isFav = progress.favorites.includes(v.id);
            const st = progress.status[v.id];

            return (
              <div key={v.id} className="relative group">
                <Link href={`/vocabulario/${v.id}`} className="block">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] border border-gray-100 dark:border-slate-700/80 flex flex-col gap-1 group-hover:border-amber-200 dark:group-hover:border-amber-900 group-hover:ring-4 group-hover:ring-amber-500/5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[1.3rem] font-black text-gray-900 dark:text-gray-100 leading-none pr-12 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {v.english_word}
                      </h3>
                      <div className="absolute top-4 right-12 flex items-center gap-1.5 pointer-events-none">
                        {st === 'learned' && (
                            <div className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 p-1.5 rounded-full" title="Aprendida">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </div>
                        )}
                        {st === 'seen' && (
                            <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 p-1.5 rounded-full" title="Vista">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-[0.95rem] font-semibold mt-1 pr-10">{v.spanish_translation}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[10px] font-extrabold text-amber-600/70 dark:text-amber-400/70 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md uppercase tracking-widest">{v.category}</div>
                      <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-widest ${
                          v.difficulty === 'easy' ? 'text-green-600 dark:text-green-500' : 
                          v.difficulty === 'medium' ? 'text-orange-600 dark:text-orange-500' : 
                          'text-red-600 dark:text-red-500'
                        }`}>
                          {v.difficulty === 'easy' ? '● ' : v.difficulty === 'medium' ? '●● ' : '●●● '}
                          {v.difficulty}
                      </span>
                    </div>
                  </div>
                </Link>
                
                <button 
                  onClick={(e) => { e.preventDefault(); toggleFavorite('global', v.id); }}
                  className="absolute top-2 right-2 p-3 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors z-10"
                  aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFav ? "text-amber-400 drop-shadow-sm" : "text-gray-300 dark:text-gray-600 hover:text-amber-400 transition-colors"}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>
            );
          })}
          
          {favItems.length > 0 && filtered.length === 0 && (
            <div className="text-center text-gray-500 py-16 font-medium flex flex-col items-center">
              No se encontraron favoritos con esa búsqueda.
            </div>
          )}
          
          {favItems.length === 0 && (
            <div className="text-center text-gray-500 py-24 font-medium flex flex-col items-center gap-5">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-full inline-block mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300 dark:text-amber-600"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <p className="text-lg">No tienes favoritos aún.</p>
              <Link href="/vocabulario" className="mt-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                Explorar Vocabulario
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
