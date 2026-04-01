'use client';

import React, {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
} from 'react';
import type { UserAcademyCloudState, ProgressSource } from '@/services/progress';
import {
  toggleFavoriteAction,
  setStatusAction,
  resetAcademyDataAction,
  updateQuizStatsAction,
} from '@/app/actions/progress';

interface AcademyProgressContextValue extends UserAcademyCloudState {
  isPending: boolean;
  toggleFavorite: (entryId: string) => void;
  setStatus: (entryId: string, status: 'new' | 'seen' | 'learned') => void;
  updateQuizStats: (isCorrect: boolean) => void;
  resetData: (type: 'all' | 'quiz' | 'favorites' | 'status') => void;
}

const AcademyProgressContext = createContext<AcademyProgressContextValue | null>(null);

interface Props {
  academyId: string;
  academySlug: string;
  source: ProgressSource;
  initialState: UserAcademyCloudState;
  children: React.ReactNode;
}

export function AcademyProgressProvider({
  academyId,
  source,
  initialState,
  children,
}: Props) {
  const [favorites, setFavorites] = useState<string[]>(initialState.favorites);
  const [status, setStatusMap] = useState<Record<string, 'new' | 'seen' | 'learned'>>(
    initialState.status
  );
  const [quizStats, setQuizStats] = useState(initialState.quizStats);
  const [isPending, startTransition] = useTransition();

  const toggleFavorite = useCallback((entryId: string) => {
    // Optimistic update
    const snapshot = favorites;
    const isFav = favorites.includes(entryId);
    setFavorites(isFav ? favorites.filter((id) => id !== entryId) : [...favorites, entryId]);

    startTransition(async () => {
      try {
        await toggleFavoriteAction({ academyId, source, entryKey: entryId });
      } catch {
        // Rollback on failure
        setFavorites(snapshot);
      }
    });
  }, [favorites, academyId, source]);

  const setStatus = useCallback((entryId: string, st: 'new' | 'seen' | 'learned') => {
    const snapshot = { ...status };
    setStatusMap((prev) => ({ ...prev, [entryId]: st }));

    startTransition(async () => {
      try {
        await setStatusAction({ academyId, source, entryKey: entryId, status: st });
      } catch {
        setStatusMap(snapshot);
      }
    });
  }, [status, academyId, source]);

  const updateQuizStats = useCallback((isCorrect: boolean) => {
    const snapQuiz = { ...quizStats };
    setQuizStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (!isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    startTransition(async () => {
      try {
        await updateQuizStatsAction({ academyId, isCorrect });
      } catch {
        setQuizStats(snapQuiz);
      }
    });
  }, [quizStats, academyId]);

  const resetData = useCallback((type: 'all' | 'quiz' | 'favorites' | 'status') => {
    const snapFavs = favorites;
    const snapStatus = { ...status };
    const snapQuiz = { ...quizStats };

    if (type === 'all' || type === 'favorites') setFavorites([]);
    if (type === 'all' || type === 'status') setStatusMap({});
    if (type === 'all' || type === 'quiz')
      setQuizStats({ correct: 0, incorrect: 0, total: 0 });

    startTransition(async () => {
      try {
        await resetAcademyDataAction({ academyId, source, type });
      } catch {
        // Rollback
        if (type === 'all' || type === 'favorites') setFavorites(snapFavs);
        if (type === 'all' || type === 'status') setStatusMap(snapStatus);
        if (type === 'all' || type === 'quiz') setQuizStats(snapQuiz);
      }
    });
  }, [favorites, status, quizStats, academyId, source]);

  return (
    <AcademyProgressContext.Provider
      value={{ favorites, status, quizStats, isPending, toggleFavorite, setStatus, updateQuizStats, resetData }}
    >
      {children}
    </AcademyProgressContext.Provider>
  );
}

export function useAcademyProgress(): AcademyProgressContextValue {
  const ctx = useContext(AcademyProgressContext);
  if (!ctx) throw new Error('useAcademyProgress must be used within AcademyProgressProvider');
  return ctx;
}
