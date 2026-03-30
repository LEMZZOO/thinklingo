'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useTheme, useVocabProgress, UserProgress, WordStatus } from '@/lib/hooks';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  progress: UserProgress;
  toggleFavorite: (id: string) => void;
  setStatus: (id: string, st: WordStatus) => void;
  updateQuizStats: (isCorrect: boolean) => void;
  resetData: (type: 'all' | 'quiz' | 'favorites' | 'status') => void;
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, isMounted: isThemeMounted } = useTheme();
  const { progress, toggleFavorite, setStatus, updateQuizStats, resetData, isMounted: isProgressMounted } = useVocabProgress();

  const isMounted = isThemeMounted && isProgressMounted;

  // We mount the children unconditionally but hide unmounted states in the UI if needed
  return (
    <AppContext.Provider value={{ theme, toggleTheme, progress, toggleFavorite, setStatus, updateQuizStats, resetData, isMounted }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
