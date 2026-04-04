'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAcademyProgress } from '@/components/academy/AcademyProgressProvider';
import { FitText } from '@/components/FitText';
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

interface AcademyFlashcardsClientProps {
  academy: Academy;
  entries: VocabularyEntry[];
}

export function AcademyFlashcardsClient({ academy, entries }: AcademyFlashcardsClientProps) {
  const { favorites, status: statusMap, toggleFavorite, setStatus } = useAcademyProgress();

  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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

  const deck = useMemo(() => {
    return entries.filter((v) => {
      const itemTargetCat = v.category?.trim() ? v.category.trim() : '_uncategorized';
      if (category && itemTargetCat !== category) return false;
      if (difficulty && v.difficulty !== difficulty) return false;
      if (onlyFavs && !favorites.includes(v.id)) return false;
      return true;
    });
  }, [entries, category, difficulty, onlyFavs, favorites]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck.length, category, difficulty, onlyFavs]);

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

  // Safe currentCard derivation
  const currentCard = deck.length > 0 ? deck[Math.min(currentIndex, deck.length - 1)] : null;

  const isFav = currentCard ? favorites.includes(currentCard.id) : false;
  const isLearned = currentCard ? statusMap[currentCard.id] === 'learned' : false;

  const handleNext = () => {
    if (currentCard && currentIndex < deck.length - 1) {
      if (statusMap[currentCard.id] !== 'learned') {
        setStatus(currentCard.id, 'seen');
      }
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  // Dynamic Styles
  const primaryBg = { backgroundColor: 'var(--academy-primary)' };
  const primaryText = { color: 'var(--academy-primary)' };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-16">
      <header className="sticky top-12 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 pt-4 pb-4">
        <div className="flex justify-between items-center mb-4">
          <Link href={`/a/${academy.slug}`} className="group flex items-center gap-3">
            <div
              style={academy.image_type === 'photo' ? {} : primaryBg}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-black/30 group-hover:scale-105 transition-transform overflow-hidden ${academy.image_type === 'photo' ? '' : 'p-1.5'}`}
            >
              {academy.logo_url ? (
                <img 
                  src={academy.logo_url} 
                  alt={academy.name} 
                  className={`w-full h-full ${academy.image_type === 'photo' ? 'object-cover' : 'object-contain'}`} 
                />
              ) : (
                <span className="text-white font-black text-sm uppercase italic">{academy.name.slice(0, 2)}</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none group-hover:text-[var(--academy-primary)] transition-colors">
                {academy.name}
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                Flashcards Exclusivas
              </p>
            </div>
          </Link>

          <span className="text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full ring-1 ring-slate-200/50 dark:ring-slate-700/50">
            {deck.length > 0 ? `${Math.min(currentIndex + 1, deck.length)} / ${deck.length}` : '0 / 0'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div ref={categoryDropdownRef} className="relative flex-1">
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shadow-sm transition hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <span className="truncate">
                  {category ? getCategoryLabel(category) : 'Todas las categorías'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className={`ml-3 transition-transform ${categoryOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
              </button>

              {categoryOpen && (
                <div className="absolute left-0 right-0 z-[60] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={() => { setCategory(''); setCategoryOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold uppercase transition ${category === '' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
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
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold uppercase transition ${active ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        style={active ? primaryBg : {}}
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
                    className={`h-11 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition flex-1 md:flex-none ${active ? 'text-white shadow-lg' : 'border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    style={active ? primaryBg : {}}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlyFavs((prev) => !prev)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${onlyFavs
                ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-400 shadow-sm'
                : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={onlyFavs ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              {onlyFavs ? 'Favoritas' : 'Todas'}
            </button>

          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6">
        {deck.length === 0 || !currentCard ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-50 grayscale">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-400"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 12h8" /></svg>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin tarjetas</p>
            <button
              type="button"
              onClick={() => { setCategory(''); setDifficulty(''); setOnlyFavs(false); }}
              className="mt-4 text-xs font-black uppercase tracking-widest"
              style={primaryText}
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center max-h-[60vh] max-w-sm mx-auto w-full">
            <div
              className="relative w-full aspect-[4/5] perspective cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className="w-full h-full relative transition-transform duration-500 preserve-3d shadow-2xl rounded-3xl"
                style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center ring-4 ring-black/5 dark:ring-white/5">
                  <div className="absolute top-6 right-6">
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                      {getCategoryLabel(currentCard.category)}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                    <FitText
                      text={currentCard.english_word}
                      maxFontSize={64}
                      minFontSize={24}
                      className="text-slate-800 dark:text-slate-100 font-black"
                    />
                  </div>

                  <p className="absolute bottom-10 text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6" /><path d="M21.34 15.57a10 10 0 1 1-.59-8.27l-5.67-5.67" /></svg>
                    Toca para girar
                  </p>
                </div>

                {/* Back Side */}
                <div
                  className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center"
                  style={{ transform: 'rotateY(180deg)', borderRightWidth: '8px', borderRightColor: 'var(--academy-primary)' }}
                >
                  <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                    <FitText
                      text={currentCard.spanish_translation}
                      maxFontSize={48}
                      minFontSize={20}
                      className="font-black"
                      style={primaryText}
                    />
                  </div>

                  <div className="w-full space-y-4 text-left border-t border-gray-50 dark:border-slate-800 pt-6 pb-2 overflow-y-auto max-h-[50%] scrollbar-hide">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">Ejemplo</h4>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 italic">
                        {currentCard.example_sentence_en?.trim()
                          ? `"${currentCard.example_sentence_en}"`
                          : <span className="text-slate-400 dark:text-slate-600 not-italic">Sin ejemplo</span>}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">Traducción</h4>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {currentCard.example_sentence_es?.trim()
                          ? `"${currentCard.example_sentence_es}"`
                          : <span className="text-slate-400 dark:text-slate-600">Sin traducción</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label="Anterior"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-lg shadow-black/5 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>

              <div className="flex gap-4">
                <button
                  type="button"
                  aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  onClick={() => toggleFavorite(currentCard.id)}
                  className={`w-16 h-16 flex items-center justify-center rounded-3xl shadow-xl transition-all active:scale-95 ${isFav
                    ? 'bg-amber-100 dark:bg-amber-950/30 border-amber-200 text-amber-500'
                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-slate-300 hover:text-amber-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                </button>

                <button
                  type="button"
                  aria-label={isLearned ? 'Marcar como nuevo' : 'Marcar como aprendido'}
                  onClick={() => setStatus(currentCard.id, isLearned ? 'new' : 'learned')}
                  style={isLearned ? primaryBg : {}}
                  className={`w-16 h-16 flex items-center justify-center rounded-3xl shadow-xl transition-all active:scale-95 ${isLearned
                    ? 'text-white border-0'
                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-slate-300 hover:text-green-500'}`}
                >
                  {isLearned ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                  )}
                </button>
              </div>

              <button
                type="button"
                aria-label="Siguiente"
                onClick={handleNext}
                disabled={currentIndex === deck.length - 1}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-lg shadow-black/5 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AcademyFlashcardsClient;
