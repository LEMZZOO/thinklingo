'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getAllVocabulary } from '@/lib/vocabulary';
import { useAppContext } from '@/components/AppProvider';
import { FitText } from '@/components/FitText';

export default function Flashcards() {
  const { progress, toggleFavorite, setStatus, isMounted } = useAppContext();
  
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Derive filters
  const allVocab = useMemo(() => getAllVocabulary(), []);
  const allCategories = useMemo(() => Array.from(new Set(allVocab.map(v => v.category))).sort(), [allVocab]);

  const deck = useMemo(() => {
    return allVocab.filter(v => {
      if (category && v.category !== category) return false;
      if (difficulty && v.difficulty !== difficulty) return false;
      if (onlyFavs && (!isMounted || !progress.favorites.includes(v.id))) return false;
      return true;
    });
  }, [allVocab, category, difficulty, onlyFavs, progress.favorites, isMounted]);

  // Reset index when deck changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck.length]);

  const currentCard = deck[currentIndex];
  
  const isFav = isMounted && currentCard ? progress.favorites.includes(currentCard.id) : false;
  const isLearned = isMounted && currentCard ? progress.status[currentCard.id] === 'learned' : false;

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      // Mark as seen automatically when we move to it
      if (isMounted && currentCard && progress.status[currentCard.id] !== 'learned') {
        setStatus(currentCard.id, 'seen');
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors pb-24">
      <header className="sticky top-0 z-20 bg-gray-50/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-4 pt-4 pb-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
            Flashcards
          </h1>
          <span className="text-sm font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {deck.length > 0 ? `${currentIndex + 1} / ${deck.length}` : '0 / 0'}
          </span>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <select 
              className="flex-1 px-3 py-2 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-700 dark:text-gray-200 font-medium appearance-none cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas Categorías</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="flex-1 px-3 py-2 rounded-xl border-none ring-1 ring-gray-200 dark:ring-slate-700 shadow-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-700 dark:text-gray-200 font-medium capitalize appearance-none cursor-pointer"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">Todas Dif.</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <label className="flex items-center gap-2 px-1 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-blue-500 focus:ring-blue-500 w-4 h-4"
              checked={onlyFavs}
              onChange={(e) => setOnlyFavs(e.target.checked)}
            />
            Solo favoritos
          </label>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4">
        {deck.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/></svg>
            <p className="font-medium text-center">No hay tarjetas con estos filtros.</p>
            <button onClick={() => { setCategory(''); setDifficulty(''); setOnlyFavs(false); }} className="text-blue-500 font-bold hover:underline">Limpiar Filtros</button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center max-h-[60vh]">
            {/* The Flashcard */}
            <div 
              className="relative w-full aspect-[4/5] perspective cursor-pointer" 
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className="w-full h-full relative transition-transform duration-500 preserve-3d"
                style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center p-4 sm:p-6 text-center ring-4 ring-black/5 dark:ring-white/5">
                  <div className="absolute top-4 right-4 flex gap-2">
                     <span className="text-[10px] font-extrabold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg uppercase tracking-widest">{currentCard.category}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center w-full p-2 overflow-hidden">
                    <FitText 
                      text={currentCard.english_word} 
                      maxFontSize={64} 
                      minFontSize={18}
                      className="text-gray-900 dark:text-gray-100 drop-shadow-sm" 
                    />
                  </div>

                  <p className="absolute bottom-6 text-gray-400 dark:text-gray-500 text-sm font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-8.27l-5.67-5.67"/></svg>
                    Toca para girar
                  </p>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center p-5 sm:p-6 text-center"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="flex-1 flex items-center justify-center w-full pt-4 px-1 overflow-hidden">
                    <FitText 
                      text={currentCard.spanish_translation} 
                      maxFontSize={48} 
                      minFontSize={20}
                      className="text-blue-600 dark:text-blue-400" 
                    />
                  </div>
                  
                  <div className="w-full space-y-4 text-left border-t border-gray-100 dark:border-slate-700 pt-5 pb-2 overflow-y-auto max-h-[60%] scrollbar-hide">
                    <div>
                      <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">Ejemplo en Inglés</h4>
                      <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 italic leading-snug">"{currentCard.example_sentence_en}"</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">Traducción</h4>
                      <p className="text-sm sm:text-base font-medium text-blue-900/80 dark:text-blue-200/80 leading-snug">"{currentCard.example_sentence_es}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all text-gray-600 dark:text-gray-300"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => toggleFavorite(currentCard.id)}
                  className={`w-14 h-14 flex items-center justify-center rounded-full shadow-sm border transition-all active:scale-95 ${
                    isFav 
                      ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 text-amber-500'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-amber-500'
                  }`}
                  aria-label="Favorito"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>

                <button 
                  onClick={() => setStatus(currentCard.id, isLearned ? 'new' : 'learned')}
                  className={`w-14 h-14 flex items-center justify-center rounded-full shadow-sm border transition-all active:scale-95 ${
                    isLearned 
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-green-500'
                  }`}
                  aria-label="Aprendida"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </button>
              </div>

              <button 
                onClick={handleNext}
                disabled={currentIndex === deck.length - 1}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all text-gray-600 dark:text-gray-300"
                aria-label="Siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
