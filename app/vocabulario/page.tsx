'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllVocabulary, searchVocabulary } from '@/lib/vocabulary';
import { useAppContext } from '@/components/AppProvider';

export default function VocabularioList() {
  const { progress, toggleFavorite, isMounted } = useAppContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const vocab = getAllVocabulary();
  const allCategories = Array.from(new Set(vocab.map(v => v.category))).sort();

  const filtered = searchVocabulary(search).filter(v => {
    const passCat = category ? v.category === category : true;
    const passDiff = difficulty ? v.difficulty === difficulty : true;
    return passCat && passDiff;
  });

  return (
    <main className="min-h-screen max-w-md mx-auto bg-gray-50/50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors">
      <header className="sticky top-0 z-20 bg-gray-50/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-4 pt-6 pb-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-4">Vocabulario</h1>
        
        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Buscar palabra o traducción..." 
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <select 
              className="flex-1 px-3 py-2.5 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-200 font-medium appearance-none cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas las cat.</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="flex-1 px-3 py-2.5 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-200 font-medium capitalize appearance-none cursor-pointer"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">Cualquier dif.</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {filtered.map(v => {
          const isFav = isMounted && progress.favorites.includes(v.id);
          const st = isMounted ? progress.status[v.id] : undefined;

          return (
          <div key={v.id} className="relative group">
            <Link href={`/vocabulario/${v.id}`} className="block">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] border border-gray-100 dark:border-slate-700/80 flex flex-col gap-1 group-hover:border-blue-200 dark:group-hover:border-blue-900 group-hover:ring-4 group-hover:ring-blue-500/5">
                <div className="flex justify-between items-start">
                  <h3 className="text-[1.3rem] font-black text-gray-900 dark:text-gray-100 leading-none pr-12 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                  <div className="text-[10px] font-extrabold text-blue-600/70 dark:text-blue-400/70 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md uppercase tracking-widest">{v.category}</div>
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
              onClick={(e) => { e.preventDefault(); toggleFavorite(v.id); }}
              className="absolute top-2 right-2 p-3 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors z-10"
              aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFav ? "text-amber-400 drop-shadow-sm" : "text-gray-300 dark:text-gray-600 hover:text-amber-400 transition-colors"}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
        )})}
        
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-20 font-medium flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300 dark:text-gray-600"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            No se encontraron resultados
          </div>
        )}
      </div>
    </main>
  );
}
