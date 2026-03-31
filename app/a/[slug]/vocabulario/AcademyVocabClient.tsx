'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/components/AppProvider';
import { Academy } from '@/types/academy';
import { VocabularyEntry } from '@/types';

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

function getCategoryLabel(category?: string | null) {
  if (!category || !category.trim()) return 'Sin categoría';
  const cat = category.trim();
  if (cat === '_uncategorized') return 'Sin categoría';
  return CATEGORY_LABELS[cat] ?? cat;
}

interface AcademyVocabClientProps {
  academy: Academy;
  entries: VocabularyEntry[];
}

export function AcademyVocabClient({ academy, entries }: AcademyVocabClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getProgress, toggleFavorite, isMounted } = useAppContext();
  const progress = getProgress(academy.slug);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      const url = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(url, { scroll: false });
    }
  }, [search, category, difficulty, pathname, router, searchParams]);

  // Sincronizar cambios de URL (ej. Back/Forward) hacia el estado local
  useEffect(() => {
    const queryQ = searchParams.get('q') || '';
    const queryCat = searchParams.get('category') || '';
    const queryDiff = searchParams.get('difficulty') || '';

    if (queryQ !== search) setSearch(queryQ);
    if (queryCat !== category) setCategory(queryCat);
    if (queryDiff !== difficulty) setDifficulty(queryDiff);
  }, [searchParams]);

  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  // Detectar y normalizar categorías únicas
  const allCategories = useMemo(() => {
    return Array.from(
      new Set(
        entries.map((v) => {
          const c = v.category?.trim();
          return c ? c : '_uncategorized';
        })
      )
    ).sort((a, b) => {
      // Si es "Sin categoría" ('_uncategorized'), mandarlo al final
      if (a === '_uncategorized') return 1;
      if (b === '_uncategorized') return -1;
      return a.localeCompare(b);
    });
  }, [entries]);

  // Orden de Filtros: 1. Búsqueda, 2. Categoría, 3. Dificultad
  const filtered = useMemo(() => {
    return entries.filter((v) => {
      // 1. Filtro de búsqueda por texto
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchEn = v.english_word.toLowerCase().includes(q);
        const matchEs = v.spanish_translation.toLowerCase().includes(q);
        const matchCat = v.category?.toLowerCase().includes(q) ?? false;
        if (!matchEn && !matchEs && !matchCat) return false;
      }

      // 2. Filtro de categoría (Normalizar categoría actual del item)
      const itemTargetCat = v.category?.trim() ? v.category.trim() : '_uncategorized';
      const passCat = category ? itemTargetCat === category : true;
      if (!passCat) return false;

      // 3. Filtro de dificultad
      const passDiff = difficulty ? v.difficulty === difficulty : true;
      if (!passDiff) return false;

      return true;
    });
  }, [entries, search, category, difficulty]);

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
      <header className="sticky top-12 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              style={{ backgroundColor: 'var(--academy-primary)' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-black/30"
            >
               {academy.logo_url ? (
                  <img src={academy.logo_url} alt={academy.name} className="w-6 h-6 object-contain" />
               ) : (
                  <span className="text-white font-black text-sm uppercase italic">{academy.name.slice(0, 2)}</span>
               )}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
                {academy.name}
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                Vocabulario Exclusivo
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--academy-primary)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>

            <input
              type="text"
              placeholder="Buscar palabra, traducción..."
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 focus:border-[var(--academy-primary)] transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
             {/* Filtro de Categoría */}
             <div ref={categoryDropdownRef} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shadow-sm transition hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <span className="truncate">
                    {category ? getCategoryLabel(category) : 'Todas las categorías'}
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
                          ? 'text-white shadow-lg'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      style={category === '' ? { backgroundColor: 'var(--academy-primary)' } : {}}
                    >
                      <span>Todas las categorías</span>
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
                              ? 'text-white shadow-lg'
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

             {/* Filtro de Dificultad */}
             <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((option) => {
                  const active = difficulty === option.value;
                  return (
                    <button
                      key={option.value || 'all'}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`h-12 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition flex-1 md:flex-none ${active
                          ? 'text-white shadow-lg'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v) => {
              const isFav = isMounted && progress.favorites.includes(v.id);
              const queryString = searchParams.toString();
              const hrefWithParams = `/a/${academy.slug}/vocabulario/${v.id}${queryString ? '?' + queryString : ''}`;

              return (
                <Link key={v.id} href={hrefWithParams} className="block relative group focus:outline-none focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-700/50 rounded-3xl">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800/80 group-hover:border-[var(--academy-primary)] transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-[var(--academy-primary)] transition-colors">
                         {v.english_word}
                       </h3>
                       <button
                          type="button"
                          aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(academy.slug, v.id);
                          }}
                          className={`p-2 rounded-xl transition-colors ${isFav ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' : 'text-slate-300 dark:text-slate-700 hover:text-amber-400'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                    </div>

                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
                      {v.spanish_translation}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800/50">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate pr-2">
                         {getCategoryLabel(v.category)}
                       </span>
                       <span 
                         className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${
                           v.difficulty === 'easy' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' :
                           v.difficulty === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' :
                           'bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                         }`}
                       >
                         {v.difficulty === 'easy' ? '● Easy' : v.difficulty === 'medium' ? '●● Medium' : '●●● Advanced'}
                       </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
