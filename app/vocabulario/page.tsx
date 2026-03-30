'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getAllVocabulary, searchVocabulary } from '@/lib/vocabulary';
import { useAppContext } from '@/components/AppProvider';

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

export default function VocabularioList() {
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
    <main className="min-h-screen max-w-md mx-auto bg-gray-50/50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors pb-24">
      <header className="sticky top-0 z-20 bg-gray-50/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-4 pt-6 pb-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-4">
          Vocabulario
        </h1>

        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Buscar palabra o traducción..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div ref={categoryDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-slate-700/70"
              >
                <span className="truncate">
                  {category ? getCategoryLabel(category) : 'Todas las categorías'}
                </span>
                <span
                  className={`ml-3 text-xs opacity-70 transition-transform ${categoryOpen ? 'rotate-180' : ''
                    }`}
                >
                  ▼
                </span>
              </button>

              {categoryOpen && (
                <div className="absolute left-0 right-0 z-[60] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('');
                      setCategoryOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${category === ''
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                  >
                    <span>Todas las categorías</span>
                    {category === '' && <span className="text-xs">✓</span>}
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${active
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                      >
                        <span>{getCategoryLabel(item)}</span>
                        {active && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((option) => {
                const active = difficulty === option.value;

                return (
                  <button
                    key={option.value || 'all'}
                    type="button"
                    onClick={() => setDifficulty(option.value)}
                    className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/70'
                      }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 px-1">
            {filtered.length} resultados encontrados
          </p>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {filtered.map((v) => {
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
                        <div
                          className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 p-1.5 rounded-full"
                          title="Aprendida"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                      )}

                      {st === 'seen' && (
                        <div
                          className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 p-1.5 rounded-full"
                          title="Vista"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-[0.95rem] font-semibold mt-1 pr-10">
                    {v.spanish_translation}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-extrabold text-blue-600/70 dark:text-blue-400/70 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md uppercase tracking-widest">
                      {getCategoryLabel(v.category)}
                    </div>

                    <span
                      className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-widest ${v.difficulty === 'easy'
                          ? 'text-green-600 dark:text-green-500'
                          : v.difficulty === 'medium'
                            ? 'text-orange-600 dark:text-orange-500'
                            : 'text-red-600 dark:text-red-500'
                        }`}
                    >
                      {v.difficulty === 'easy'
                        ? '● Easy'
                        : v.difficulty === 'medium'
                          ? '●● Medium'
                          : '●●● Advanced'}
                    </span>
                  </div>
                </div>
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(v.id);
                }}
                className="absolute top-2 right-2 p-3 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors z-10"
                aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={isFav ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    isFav
                      ? 'text-amber-400 drop-shadow-sm'
                      : 'text-gray-300 dark:text-gray-600 hover:text-amber-400 transition-colors'
                  }
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-20 font-medium flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 text-gray-300 dark:text-gray-600"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            No se encontraron resultados
          </div>
        )}
      </div>
    </main>
  );
}