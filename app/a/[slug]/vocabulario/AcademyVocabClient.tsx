'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getAllVocabulary, searchVocabulary } from '@/lib/vocabulary';
import { useAppContext } from '@/components/AppProvider';
import { Academy } from '@/types/academy';

const CATEGORY_LABELS: Record<string, string> = {
  adjectives: 'Adjetivos',
  communication: 'Comunicación',
  connectors: 'Conectores',
  'daily-life': 'Vida diaria',
  emotions: 'Emociones',
  expressions: 'Expresiones',
  food: 'Comida',
  health: 'Salud',
  home: 'Hogar',
  people: 'Personas',
  shopping: 'Compras',
  study: 'Estudio',
  technology: 'Tecnología',
  time: 'Tiempo',
  travel: 'Viajes',
  verbs: 'Verbos',
  work: 'Trabajo',
};

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'advanced', label: 'Advanced' },
];

function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}

interface AcademyVocabClientProps {
  academy: Academy;
}

export function AcademyVocabClient({ academy }: AcademyVocabClientProps) {
  const { progress, toggleFavorite, isMounted } = useAppContext();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  const vocab = getAllVocabulary();
  const allCategories = Array.from(new Set(vocab.map((v) => v.category))).sort();

  const filtered = searchVocabulary(search).filter((v) => {
    const passCat = category ? v.category === category : true;
    const passDiff = difficulty ? v.difficulty === difficulty : true;
    return passCat && passDiff;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-16">
      {/* Academy Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/a/${academy.slug}`} className="group flex items-center gap-3">
            <div 
              style={{ backgroundColor: 'var(--academy-primary)' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-(--academy-primary)/20 group-hover:scale-105 transition-transform"
            >
               {academy.logo_url ? (
                  <img src={academy.logo_url} alt={academy.name} className="w-6 h-6 object-contain" />
               ) : (
                  <span className="text-white font-black text-sm uppercase italic">{academy.name.slice(0, 2)}</span>
               )}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none group-hover:text-(--academy-primary) transition-colors">
                {academy.name}
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                Vocabulario Exclusivo
              </p>
            </div>
          </Link>

          <Link 
            href={`/a/${academy.slug}`}
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-(--academy-primary) transition-colors"
          >
            Volver
          </Link>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-(--academy-primary) transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>

            <input
              type="text"
              placeholder="Buscar palabra..."
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-(--academy-primary)/20 focus:border-(--academy-primary) transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
             <div ref={categoryDropdownRef} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shadow-sm transition hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <span className="truncate">
                    {category ? getCategoryLabel(category) : 'Categoría'}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    className={`ml-3 transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 right-0 z-[60] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('');
                        setCategoryOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold uppercase transition ${category === ''
                          ? 'text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      style={category === '' ? { backgroundColor: 'var(--academy-primary)' } : {}}
                    >
                      <span>Todas</span>
                    </button>

                    {allCategories.map((item) => {
                      const active = category === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setCategory(item);
                            setCategoryOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold uppercase transition ${active
                              ? 'text-white'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                          style={active ? { backgroundColor: 'var(--academy-primary)' } : {}}
                        >
                          <span>{getCategoryLabel(item)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
             </div>

             <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((option) => {
                  const active = difficulty === option.value;
                  return (
                    <button
                      key={option.value || 'all'}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`h-12 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition flex-1 md:flex-none ${active
                          ? 'text-white shadow-lg shadow-(--academy-primary)/20'
                          : 'border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                        style={active ? { backgroundColor: 'var(--academy-primary)' } : {}}
                    >
                      {option.label}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>
      </header>

      {/* Vocabulary List */}
      <section className="flex-1 p-6 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 ml-1">
          {filtered.length} palabras encontradas
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 grayscale">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((v) => {
              const isFav = isMounted && progress.favorites.includes(v.id);
              return (
                <div key={v.id} className="relative group">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800/80 group-hover:border-(--academy-primary) transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-(--academy-primary) transition-colors">
                         {v.english_word}
                       </h3>
                       <button
                          onClick={() => toggleFavorite(v.id)}
                          className={`p-2 rounded-xl transition-colors ${isFav ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' : 'text-slate-300 dark:text-slate-700 hover:text-amber-400'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                    </div>

                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
                      {v.spanish_translation}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800/50">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                         {getCategoryLabel(v.category)}
                       </span>
                       <span 
                         className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                           v.difficulty === 'easy' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' :
                           v.difficulty === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' :
                           'bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                         }`}
                       >
                         {v.difficulty === 'easy' ? '● Easy' : v.difficulty === 'medium' ? '●● Medium' : '●●● Advanced'}
                       </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
