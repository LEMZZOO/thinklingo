'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage } from './storage';

export type WordStatus = 'new' | 'seen' | 'learned';

export interface UserProgress {
  favorites: string[];
  status: Record<string, WordStatus>;
  quizStats: {
    correct: number;
    incorrect: number;
    total: number;
  };
}

const DEFAULT_PROGRESS: UserProgress = {
  favorites: [],
  status: {},
  quizStats: { correct: 0, incorrect: 0, total: 0 },
};

type AllProgress = Record<string, UserProgress>;

export function useVocabProgress() {
  const [allProgress, setAllProgress] = useState<AllProgress>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Migration & Load logic
    const oldFormat = getFromStorage<any>('progress', null);
    let loadedV2 = getFromStorage<AllProgress>('progress_v2', {});

    // If no v2 progress, but old v1 exists with an array of favorites, migrate it to a 'global' namespace
    if (Object.keys(loadedV2).length === 0 && oldFormat && Array.isArray(oldFormat.favorites)) {
      loadedV2 = { global: oldFormat };
      saveToStorage('progress_v2', loadedV2);
    }
    
    setAllProgress(loadedV2);
    setMounted(true);
  }, []);

  const getProgress = useCallback((academyKey: string) => {
    return allProgress[academyKey] || DEFAULT_PROGRESS;
  }, [allProgress]);

  const toggleFavorite = useCallback((academyKey: string, id: string) => {
    setAllProgress((prev) => {
      const prog = prev[academyKey] || DEFAULT_PROGRESS;
      const isFav = prog.favorites.includes(id);
      const newFavs = isFav 
        ? prog.favorites.filter((fid) => fid !== id)
        : [...prog.favorites, id];
        
      const newState = { ...prev, [academyKey]: { ...prog, favorites: newFavs } };
      saveToStorage('progress_v2', newState);
      return newState;
    });
  }, []);

  const setStatus = useCallback((academyKey: string, id: string, st: WordStatus) => {
    setAllProgress((prev) => {
      const prog = prev[academyKey] || DEFAULT_PROGRESS;
      const newState = {
        ...prev,
        [academyKey]: { ...prog, status: { ...prog.status, [id]: st } },
      };
      saveToStorage('progress_v2', newState);
      return newState;
    });
  }, []);

  const updateQuizStats = useCallback((academyKey: string, isCorrect: boolean) => {
    setAllProgress((prev) => {
      const prog = prev[academyKey] || DEFAULT_PROGRESS;
      const stats = prog.quizStats || { correct: 0, incorrect: 0, total: 0 };
      const newState = {
        ...prev,
        [academyKey]: {
          ...prog,
          quizStats: {
            correct: stats.correct + (isCorrect ? 1 : 0),
            incorrect: stats.incorrect + (isCorrect ? 0 : 1),
            total: stats.total + 1,
          }
        }
      };
      saveToStorage('progress_v2', newState);
      return newState;
    });
  }, []);

  const resetData = useCallback((academyKey: string, type: 'all' | 'quiz' | 'favorites' | 'status') => {
    setAllProgress((prev) => {
      const prog = prev[academyKey] || DEFAULT_PROGRESS;
      let newProg = { ...prog };

      if (type === 'all') {
        newProg = {
          favorites: [],
          status: {},
          quizStats: { correct: 0, incorrect: 0, total: 0 }
        };
      } else if (type === 'quiz') {
        newProg.quizStats = { correct: 0, incorrect: 0, total: 0 };
      } else if (type === 'favorites') {
        newProg.favorites = [];
      } else if (type === 'status') {
        newProg.status = {};
      }

      const newState = { ...prev, [academyKey]: newProg };
      saveToStorage('progress_v2', newState);
      return newState;
    });
  }, []);

  return { getProgress, toggleFavorite, setStatus, updateQuizStats, resetData, isMounted: mounted };
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getFromStorage<'light'|'dark'>('theme', 'light');
    setTheme(saved);
    setMounted(true);
    
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      saveToStorage('theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme, isMounted: mounted };
}
