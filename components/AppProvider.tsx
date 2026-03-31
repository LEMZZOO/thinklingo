'use client';

import { createContext, useContext } from 'react';
import { useTheme, useVocabProgress, UserProgress, WordStatus } from '@/lib/hooks';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  getProgress: (academyKey: string) => UserProgress;
  toggleFavorite: (academyKey: string, id: string) => void;
  setStatus: (academyKey: string, id: string, st: WordStatus) => void;
  updateQuizStats: (academyKey: string, isCorrect: boolean) => void;
  resetData: (academyKey: string, type: 'all' | 'quiz' | 'favorites' | 'status') => void;
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, isMounted: isThemeMounted } = useTheme();
  const { getProgress, toggleFavorite, setStatus, updateQuizStats, resetData, isMounted: isProgressMounted } = useVocabProgress();

  const isMounted = isThemeMounted && isProgressMounted;

  // We mount the children unconditionally but hide unmounted states in the UI if needed
  return (
    <AppContext.Provider value={{ theme, toggleTheme, getProgress, toggleFavorite, setStatus, updateQuizStats, resetData, isMounted }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
