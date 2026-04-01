'use client';

import React from 'react';

interface Props {
  favoritesAdded: number;
  favoritesRemoved: number;
  wordsSeenInRange: number;
  wordsLearnedInRange: number;
  quizAnswered: number;
  quizCorrect: number;
  quizIncorrect: number;
}

export function AcademyAnalyticsBarChart(props: Props) {
  const data = [
    { label: 'Favoritos +', value: props.favoritesAdded, color: 'bg-emerald-500' },
    { label: 'Favoritos -', value: props.favoritesRemoved, color: 'bg-rose-500' },
    { label: 'Seen', value: props.wordsSeenInRange, color: 'bg-blue-500' },
    { label: 'Learned', value: props.wordsLearnedInRange, color: 'bg-indigo-500' },
    { label: 'Quiz Resp.', value: props.quizAnswered, color: 'bg-slate-400' },
    { label: 'Quiz Corr.', value: props.quizCorrect, color: 'bg-emerald-400' },
    { label: 'Quiz Inc.', value: props.quizIncorrect, color: 'bg-orange-500' },
  ];

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const allZero = data.every(d => d.value === 0);

  if (allZero) {
    return (
      <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-3xl text-slate-400 text-sm font-bold bg-gray-50/50 dark:bg-slate-950/20">
        Sin actividad en este rango.
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="h-48 flex items-end gap-1.5 sm:gap-3 px-2">
        {data.map((item, i) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 z-10 pointer-events-none">
                <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg border border-slate-700 shadow-xl">
                  {item.value}
                </div>
              </div>
              <div 
                className={`w-full rounded-t-lg transition-all duration-700 ease-out hover:brightness-110 active:scale-95 cursor-default ${item.color}`}
                style={{ height: `${heightPercent}%`, minHeight: item.value > 0 ? '4px' : '0' }}
              />
              <div className="absolute -bottom-8 w-full text-center">
                <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400 leading-tight block truncate">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 border-t border-gray-100 dark:border-slate-800" />
    </div>
  );
}
