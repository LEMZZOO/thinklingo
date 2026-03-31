'use client';

import React, { createContext, useContext, useState, startTransition } from 'react';
import { DBUserProgress } from '@/services/progress';
import { WordStatus } from '@/lib/hooks';
import { 
  toggleFavoriteAction, 
  setStatusAction, 
  updateQuizStatsAction, 
  resetDataAction 
} from '@/app/actions/progress';

interface AcademyProgressContextType extends DBUserProgress {
  toggleFavorite: (id: string) => void;
  setStatus: (id: string, st: WordStatus) => void;
  updateQuizStats: (isCorrect: boolean) => void;
  resetData: (type: 'all' | 'quiz' | 'favorites' | 'status') => void;
}

const AcademyProgressContext = createContext<AcademyProgressContextType | null>(null);

export function AcademyProgressProvider({ 
  children,
  initialData,
  academyId,
  source
}: { 
  children: React.ReactNode;
  initialData: DBUserProgress;
  academyId: string;
  source: 'json' | 'academy_db';
}) {
  const [favorites, setFavorites] = useState<string[]>(initialData.favorites);
  const [status, setStatusMap] = useState<Record<string, WordStatus>>(initialData.status);
  const [quizStats, setQuizStats] = useState(initialData.quizStats);

  const toggleFavorite = (id: string) => {
    // 1. Mutar UI de forma optimista instántanea
    const isFav = favorites.includes(id);
    if (isFav) {
      setFavorites(prev => prev.filter(fid => fid !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }

    // 2. Ejecutar Action en background server side
    startTransition(() => {
      toggleFavoriteAction(academyId, source, id);
    });
  };

  const setStatus = (id: string, st: WordStatus) => {
    setStatusMap(prev => ({ ...prev, [id]: st }));
    startTransition(() => {
      setStatusAction(academyId, source, id, st);
    });
  };

  const updateQuizStats = (isCorrect: boolean) => {
    setQuizStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (!isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    startTransition(() => {
      updateQuizStatsAction(academyId, isCorrect);
    });
  };

  const resetData = (type: 'all' | 'quiz' | 'favorites' | 'status') => {
    if (type === 'all' || type === 'favorites') setFavorites([]);
    if (type === 'all' || type === 'status') setStatusMap({});
    if (type === 'all' || type === 'quiz') setQuizStats({ correct: 0, incorrect: 0, total: 0 });

    startTransition(() => {
      resetDataAction(academyId, type);
    });
  };

  return (
    <AcademyProgressContext.Provider value={{ 
      favorites, 
      status, 
      quizStats, 
      toggleFavorite, 
      setStatus, 
      updateQuizStats, 
      resetData 
    }}>
      {children}
    </AcademyProgressContext.Provider>
  );
}

export function useAcademyProgress() {
  const ctx = useContext(AcademyProgressContext);
  if (!ctx) throw new Error('useAcademyProgress must be used within AcademyProgressProvider');
  return ctx;
}
