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

export function useVocabProgress() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = getFromStorage<UserProgress>('progress', DEFAULT_PROGRESS);
    if (loaded && typeof loaded === 'object') {
      setProgress({
        favorites: loaded.favorites || [],
        status: loaded.status || {},
        quizStats: loaded.quizStats || { correct: 0, incorrect: 0, total: 0 },
      });
    }
    setMounted(true);
  }, []);

  const saveAndSet = useCallback((newProgress: UserProgress) => {
    setProgress(newProgress);
    saveToStorage('progress', newProgress);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setProgress((prev) => {
      const isFav = prev.favorites.includes(id);
      const newFavs = isFav 
        ? prev.favorites.filter((fid) => fid !== id)
        : [...prev.favorites, id];
        
      const newState = { ...prev, favorites: newFavs };
      saveToStorage('progress', newState);
      return newState;
    });
  }, []);

  const setStatus = useCallback((id: string, st: WordStatus) => {
    setProgress((prev) => {
      const newState = {
        ...prev,
        status: { ...prev.status, [id]: st },
      };
      saveToStorage('progress', newState);
      return newState;
    });
  }, []);

  const updateQuizStats = useCallback((isCorrect: boolean) => {
    setProgress((prev) => {
      const stats = prev.quizStats || { correct: 0, incorrect: 0, total: 0 };
      const newState = {
        ...prev,
        quizStats: {
          correct: stats.correct + (isCorrect ? 1 : 0),
          incorrect: stats.incorrect + (isCorrect ? 0 : 1),
          total: stats.total + 1,
        }
      };
      saveToStorage('progress', newState);
      return newState;
    });
  }, []);

  const resetData = useCallback((type: 'all' | 'quiz' | 'favorites' | 'status') => {
    setProgress((prev) => {
      let newState = { ...prev };
      if (type === 'all') {
        newState = DEFAULT_PROGRESS;
      } else if (type === 'quiz') {
        newState.quizStats = { correct: 0, incorrect: 0, total: 0 };
      } else if (type === 'favorites') {
        newState.favorites = [];
      } else if (type === 'status') {
        newState.status = {};
      }
      saveToStorage('progress', newState);
      return newState;
    });
  }, []);

  return { progress, toggleFavorite, setStatus, updateQuizStats, resetData, isMounted: mounted };
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
