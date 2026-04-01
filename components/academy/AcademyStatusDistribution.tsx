'use client';

import React from 'react';

interface AcademyStatusDistributionProps {
  newCount: number;
  seenCount: number;
  learnedCount: number;
  totalVocabulary: number;
}

export function AcademyStatusDistribution({
  newCount,
  seenCount,
  learnedCount,
  totalVocabulary,
}: AcademyStatusDistributionProps) {
  const safeTotal = Math.max(totalVocabulary, 1);
  
  // Cálculo de porcentajes para CSS
  const pNew = (newCount / safeTotal) * 100;
  const pSeen = (seenCount / safeTotal) * 100;
  const pLearned = (learnedCount / safeTotal) * 100;

  const barData = [
    { label: 'Learned', count: learnedCount, pct: pLearned, color: 'bg-green-500', textColor: 'text-green-500' },
    { label: 'Seen', count: seenCount, pct: pSeen, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { label: 'New', count: newCount, pct: pNew, color: 'bg-slate-200 dark:bg-slate-700', textColor: 'text-slate-400' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1">Evolución de Aprendizaje</h3>
        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">{totalVocabulary} Palabras</span>
      </div>

      <div className="w-full h-3 flex bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-4 ring-slate-50 dark:ring-slate-900/50">
        {barData.map((segment) => (
          <div
            key={segment.label}
            style={{ width: `${segment.pct}%` }}
            className={`${segment.color} transition-all duration-700 ease-out h-full first:rounded-l-full last:rounded-r-full`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        {barData.map((segment) => (
          <div key={segment.label}>
            <div className={`text-lg font-black ${segment.textColor} leading-none mb-1 tabular-nums`}>
               {totalVocabulary > 0 ? Math.round((segment.count / totalVocabulary) * 100) : 0}%
            </div>
            <div className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-tight">
              {segment.count} {segment.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
