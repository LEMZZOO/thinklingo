'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/components/AppProvider';
import { VocabularyEntry } from '@/types';
import { FitText } from '@/components/FitText';
import { Academy } from '@/types/academy';
import { InlineNotice } from '@/components/InlineNotice';

type QuizMode = 'en-es' | 'es-en';

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

interface AcademyQuizClientProps {
  academy: Academy;
  entries: VocabularyEntry[];
}

export default function AcademyQuizClient({ academy, entries }: AcademyQuizClientProps) {
  const { getProgress, updateQuizStats, isMounted } = useAppContext();
  const progress = getProgress(academy.slug);

  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<QuizMode>('en-es');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const [deck, setDeck] = useState<VocabularyEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<VocabularyEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  const allCategories = useMemo(() => {
    return Array.from(
      new Set(
        entries.map((v) => {
          const c = v.category?.trim();
          return c ? c : '_uncategorized';
        })
      )
    ).sort((a, b) => {
      if (a === '_uncategorized') return 1;
      if (b === '_uncategorized') return -1;
      return a.localeCompare(b);
    });
  }, [entries]);

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

  const generateOptions = (correct: VocabularyEntry) => {
    const others = entries.filter((v) => v.id !== correct.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const selectedWrong = shuffledOthers.slice(0, 3);
    return [correct, ...selectedWrong].sort(() => Math.random() - 0.5);
  };

  const handleStart = () => {
    let filtered = entries.filter((v) => {
      const itemTargetCat = v.category?.trim() ? v.category.trim() : '_uncategorized';
      if (category && itemTargetCat !== category) return false;
      if (difficulty && v.difficulty !== difficulty) return false;
      if (onlyFavs && (!isMounted || !progress.favorites.includes(v.id))) return false;
      return true;
    });

    if (filtered.length === 0) {
      setAlertMsg('Sin palabras para estos filtros.');
      return;
    }

    setAlertMsg(null);
    filtered = [...filtered].sort(() => Math.random() - 0.5);

    setDeck(filtered);
    setCurrentIndex(0);
    setOptions(generateOptions(filtered[0]));
    setSelectedId(null);
    setIsAnswered(false);
    setHasStarted(true);
  };

  const currentCard = deck.length > 0 ? deck[Math.min(currentIndex, deck.length - 1)] : null;

  const handleSelect = (id: string) => {
    if (isAnswered || !currentCard) return;
    setSelectedId(id);
    setIsAnswered(true);

    const isCorrect = id === currentCard.id;
    updateQuizStats(academy.slug, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setOptions(generateOptions(deck[nextIndex]));
      setSelectedId(null);
      setIsAnswered(false);
    } else {
      setHasStarted(false);
    }
  };

  // Dynamic Styles
  const primaryBg = { backgroundColor: 'var(--academy-primary)' };
  const primaryText = { color: 'var(--academy-primary)' };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-16">
      <header className="sticky top-12 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 pt-4 pb-4">
        <div className="flex justify-between items-center mb-4">
          <Link href={`/a/${academy.slug}`} className="group flex items-center gap-3">
             <div 
               style={primaryBg}
               className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-black/30 group-hover:scale-105 transition-transform"
             >
                {academy.logo_url ? (
                   <img src={academy.logo_url} alt={academy.name} className="w-6 h-6 object-contain" />
                ) : (
                   <span className="text-white font-black text-sm uppercase italic">{academy.name.slice(0, 2)}</span>
                )}
             </div>
             <div>
               <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none group-hover:text-[var(--academy-primary)] transition-colors">
                 {academy.name}
               </h1>
               <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                 Reto de Academia
               </p>
             </div>
          </Link>

          {hasStarted && (
            <span className="text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full ring-1 ring-slate-200/50 dark:ring-slate-700/50">
               {currentIndex + 1} / {deck.length}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        {!hasStarted ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Quiz</h2>
              <p className="text-sm font-bold text-slate-400">Ponte a prueba con el vocabulario oficial.</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-3">Modo</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('en-es')}
                    className={`p-4 rounded-2xl border-2 transition-all font-black text-xs ${mode === 'en-es'
                        ? 'border-[var(--academy-primary)] bg-[var(--academy-primary)]/5 text-[var(--academy-primary)]'
                        : 'border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-gray-200 dark:hover:border-slate-700'
                      }`}
                    style={mode === 'en-es' ? { borderColor: 'var(--academy-primary)', backgroundColor: 'color-mix(in srgb, var(--academy-primary) 5%, transparent)', color: 'var(--academy-primary)' } : {}}
                  >
                    EN → ES
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('es-en')}
                    className={`p-4 rounded-2xl border-2 transition-all font-black text-xs ${mode === 'es-en'
                        ? 'border-[var(--academy-primary)] bg-[var(--academy-primary)]/5 text-[var(--academy-primary)]'
                        : 'border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-gray-200 dark:hover:border-slate-700'
                      }`}
                    style={mode === 'es-en' ? { borderColor: 'var(--academy-primary)', backgroundColor: 'color-mix(in srgb, var(--academy-primary) 5%, transparent)', color: 'var(--academy-primary)' } : {}}
                  >
                    ES → EN
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-3">Filtros</h3>
                <div className="space-y-3">
                  <div ref={categoryDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoryOpen((prev) => !prev)}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 shadow-sm transition hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <span className="truncate">
                        {category ? getCategoryLabel(category) : 'Todas las categorías'}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className={`ml-3 transition-transform ${categoryOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                    </button>

                    {categoryOpen && (
                      <div className="absolute left-0 right-0 z-[60] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
                        <button
                          type="button"
                          onClick={() => { setCategory(''); setCategoryOpen(false); }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-black uppercase transition ${category === '' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          style={category === '' ? primaryBg : {}}
                        >
                          <span>Todas las categorías</span>
                        </button>
                        {allCategories.map((item) => {
                          const active = category === item;
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => { setCategory(item); setCategoryOpen(false); }}
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-black uppercase transition ${active ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                              style={active ? primaryBg : {}}
                            >
                              <span>{getCategoryLabel(item)}</span>
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
                          className={`h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition flex-1 md:flex-none ${active ? 'text-white shadow-lg' : 'border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                          style={active ? primaryBg : {}}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setOnlyFavs((prev) => !prev)}
                    className={`w-full flex items-center justify-center gap-3 rounded-2xl border px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${onlyFavs 
                      ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-400 shadow-sm'
                      : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={onlyFavs ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Favoritas
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {alertMsg && <InlineNotice type="warning" message={alertMsg} onClose={() => setAlertMsg(null)} />}
              
              <button
                type="button"
                onClick={handleStart}
                style={primaryBg}
                className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                Comenzar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500">
            <button
              type="button"
              onClick={() => setHasStarted(false)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-2 self-start transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Abandonar
            </button>

            {currentCard ? (
               <>
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800 p-10 flex flex-col items-center justify-center min-h-[35vh] relative ring-4 ring-black/5 dark:ring-white/5">
                    <div className="absolute top-6 right-6">
                      <span className="text-[10px] font-black uppercase tracking-widest border px-3 py-1.5 rounded-lg shadow-sm" style={{ color: 'var(--academy-primary)', backgroundColor: 'color-mix(in srgb, var(--academy-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--academy-primary) 10%, transparent)' }}>
                        {getCategoryLabel(currentCard.category)}
                      </span>
                    </div>

                    <h2 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-4">
                       En {mode === 'en-es' ? 'Español' : 'Inglés'}...
                    </h2>

                    <div className="w-full h-28 overflow-hidden">
                      <FitText
                        text={mode === 'en-es' ? currentCard.english_word : currentCard.spanish_translation}
                        maxFontSize={56}
                        minFontSize={24}
                        className="font-black text-slate-800 dark:text-slate-100 drop-shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {options.map((opt) => {
                      const isCorrectOption = opt.id === currentCard.id;
                      const isSelected = selectedId === opt.id;

                      let classes = 'p-6 rounded-2xl border-2 text-left font-black transition-all ';

                      if (isAnswered) {
                        if (isCorrectOption) {
                          classes += 'bg-green-500 scale-[1.02] text-white border-green-500 shadow-lg shadow-green-500/20 z-10';
                        } else if (isSelected) {
                          classes += 'bg-red-500 text-white border-red-500 opacity-80';
                        } else {
                          classes += 'bg-white dark:bg-slate-900 border-gray-50 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-40';
                        }
                      } else {
                        classes += 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-lg';
                      }

                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => handleSelect(opt.id)}
                          disabled={isAnswered}
                          className={classes}
                          style={!isAnswered ? { borderColor: 'color-mix(in srgb, var(--academy-primary) 5%, transparent)' } : {}}
                        >
                          {mode === 'en-es' ? opt.spanish_translation : opt.english_word}
                        </button>
                      );
                    })}
                  </div>

                  <div className={`mt-4 transition-all duration-500 ${isAnswered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <button
                      type="button"
                      onClick={handleNext}
                      style={primaryBg}
                      className="w-full text-white font-black text-lg py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                    >
                      {currentIndex < deck.length - 1 ? 'Siguiente' : 'Finalizar'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
               </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-50 grayscale">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-400"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Error de carga</p>
                <button type="button" onClick={() => setHasStarted(false)} className="mt-4 text-xs font-black uppercase tracking-widest" style={primaryText}>Reiniciar</button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
