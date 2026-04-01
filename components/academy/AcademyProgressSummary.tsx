'use client';

import React from 'react';

interface AcademyProgressSummaryProps {
  favoritesCount: number;
  seenCount: number;
  learnedCount: number;
  totalVocabulary: number;
  quizCorrect: number;
  quizIncorrect: number;
  quizTotal: number;
}

export function AcademyProgressSummary({
  favoritesCount,
  seenCount,
  learnedCount,
  totalVocabulary,
  quizCorrect,
  quizTotal,
}: AcademyProgressSummaryProps) {
  const cards = [
    { label: 'Favoritos', value: favoritesCount, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Seen', value: seenCount, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Learned', value: learnedCount, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
    { label: 'Total vocabulario', value: totalVocabulary, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
    { label: 'Quiz correctas', value: quizCorrect, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Quiz total', value: quizTotal, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`${card.bg} p-4 rounded-2xl border border-gray-100/50 dark:border-white/5 shadow-sm flex flex-col items-center justify-center text-center transition-transform active:scale-[0.98]`}>
          <span className={`text-2xl font-black ${card.color} mb-1 transition-all tabular-nums leading-none`}>
            {card.value}
          </span>
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}
