'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getAllVocabulary } from '@/lib/vocabulary';
import { useAppContext } from '@/components/AppProvider';
import { VocabularyEntry } from '@/types';
import { FitText } from '@/components/FitText';

type QuizMode = 'en-es' | 'es-en';

export default function Quiz() {
  const { progress, updateQuizStats, isMounted } = useAppContext();
  
  // Setup State
  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<QuizMode>('en-es');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);

  // Play State
  const [deck, setDeck] = useState<VocabularyEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<VocabularyEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Data
  const allVocab = useMemo(() => getAllVocabulary(), []);
  const allCategories = useMemo(() => Array.from(new Set(allVocab.map(v => v.category))).sort(), [allVocab]);

  const generateOptions = (correct: VocabularyEntry) => {
    const others = allVocab.filter(v => v.id !== correct.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const selectedWrong = shuffledOthers.slice(0, 3);
    return [correct, ...selectedWrong].sort(() => Math.random() - 0.5);
  };

  const handleStart = () => {
    let filtered = allVocab.filter(v => {
      if (category && v.category !== category) return false;
      if (difficulty && v.difficulty !== difficulty) return false;
      if (onlyFavs && (!isMounted || !progress.favorites.includes(v.id))) return false;
      return true;
    });

    if (filtered.length === 0) {
      alert("No hay palabras que coincidan con estos filtros.");
      return;
    }

    // Shuffle the deck for the quiz
    filtered = [...filtered].sort(() => Math.random() - 0.5);
    
    setDeck(filtered);
    setCurrentIndex(0);
    setOptions(generateOptions(filtered[0]));
    setSelectedId(null);
    setIsAnswered(false);
    setHasStarted(true);
  };

  const currentCard = deck[currentIndex];

  const handleSelect = (id: string) => {
    if (isAnswered) return;
    setSelectedId(id);
    setIsAnswered(true);
    
    const isCorrect = id === currentCard.id;
    updateQuizStats(isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setOptions(generateOptions(deck[nextIndex]));
      setSelectedId(null);
      setIsAnswered(false);
    } else {
      // Finished the deck! Reset back to start
      setHasStarted(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-purple-100 dark:selection:bg-purple-900 transition-colors pb-24">
      <header className="sticky top-0 z-20 bg-gray-50/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-2">
           <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/40 p-1.5 rounded-xl text-purple-600 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </div>
            Quiz
          </h1>
          {hasStarted && (
             <span className="text-sm font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
               {currentIndex + 1} / {deck.length}
             </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4">
        {!hasStarted ? (
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-6 flex-1 flex flex-col">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Configura tu Sesión</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Filtra el vocabulario y elige el modo de aprendizaje.</p>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Modo de Quiz</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setMode('en-es')}
                    className={`p-3 rounded-2xl border-2 transition-all font-bold text-sm ${mode === 'en-es' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-purple-200'}`}
                  >
                    Inglés → Español
                  </button>
                  <button 
                     onClick={() => setMode('es-en')}
                    className={`p-3 rounded-2xl border-2 transition-all font-bold text-sm ${mode === 'es-en' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-purple-200'}`}
                  >
                    Español → Inglés
                  </button>
                </div>
              </div>

               <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Filtros (Opcional)</label>
                <div className="flex flex-col gap-3">
                  <select 
                    className="w-full px-4 py-3.5 rounded-2xl border ring-1 ring-gray-100 dark:ring-slate-700/50 shadow-sm bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-700 dark:text-gray-200 font-bold appearance-none cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Todas las Categorías</option>
                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select 
                    className="w-full px-4 py-3.5 rounded-2xl border ring-1 ring-gray-100 dark:ring-slate-700/50 shadow-sm bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-700 dark:text-gray-200 font-bold capitalize appearance-none cursor-pointer"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="">Cualquier Dificultad</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="advanced">Advanced</option>
                  </select>

                  <label className="flex items-center gap-3 p-3 mt-1 bg-amber-50 dark:bg-amber-900/10 rounded-2xl cursor-pointer border border-amber-100 dark:border-amber-900/30">
                    <input 
                      type="checkbox" 
                      className="rounded text-amber-500 focus:ring-amber-500 w-5 h-5 accent-amber-500"
                      checked={onlyFavs}
                      onChange={(e) => setOnlyFavs(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-500">Solo mis Palabras Favoritas</span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStart}
              className="w-full bg-purple-600 text-white font-black text-lg text-center py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:bg-purple-700 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              Comenzar Quiz
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col max-h-[75vh]">
            <button 
              onClick={() => setHasStarted(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pb-4 inline-flex items-center gap-1 self-start active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Abandonar sesión
            </button>

            {/* Prompt Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center min-h-[30%] mb-6 relative">
              <div className="absolute top-4 right-4">
                 <span className="text-[9px] font-extrabold text-purple-500 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded uppercase tracking-widest">{currentCard.category}</span>
              </div>
              <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                 ¿Qué significa en {mode === 'en-es' ? 'Español' : 'Inglés'}?
              </h2>
              <div className="w-full h-24 overflow-hidden">
                <FitText 
                  text={mode === 'en-es' ? currentCard.english_word : currentCard.spanish_translation} 
                  maxFontSize={48} 
                  minFontSize={20}
                  className={mode === 'en-es' ? "text-gray-900 dark:text-gray-100 font-black drop-shadow-sm" : "text-blue-600 dark:text-blue-400 font-black"} 
                />
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 flex-1">
              {options.map((opt) => {
                const isCorrectOption = opt.id === currentCard.id;
                const isSelected = selectedId === opt.id;
                
                let stateClasses = "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-purple-300 hover:shadow-md";
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    stateClasses = "bg-green-500 text-white border-green-500 shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] ring-4 ring-green-500/20 z-10 scale-[1.02] transition-all";
                  } else if (isSelected) {
                    stateClasses = "bg-red-500 text-white border-red-500 opacity-80 scale-95 transition-all";
                  } else {
                    stateClasses = "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-500 opacity-50";
                  }
                }

                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={isAnswered}
                    className={`p-5 rounded-2xl border text-left font-bold transition-all ${stateClasses}`}
                  >
                    {mode === 'en-es' ? opt.spanish_translation : opt.english_word}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <div className={`mt-6 transition-all duration-300 ${isAnswered ? 'opacity-100 translate-y-0 relative block' : 'opacity-0 translate-y-4 hidden'}`}>
              <button 
                onClick={handleNext}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg text-center py-4 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {currentIndex < deck.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Quiz'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
