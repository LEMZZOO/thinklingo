'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAcademyProgress } from '@/components/academy/AcademyProgressProvider';
import { Academy } from '@/types/academy';
import { InlineConfirm } from '@/components/InlineConfirm';
import { AcademyAnalyticsDateRangeForm } from '@/components/academy/AcademyAnalyticsDateRangeForm';
import { AcademyAnalyticsBarChart } from '@/components/academy/AcademyAnalyticsBarChart';
import { getOwnAnalyticsSummaryAction } from './actions';
import { StudentAnalyticsSummary } from '@/types/academy-analytics';

interface AcademyProgressClientProps {
  academy: Academy;
  totalVocabulary: number;
}

import { AcademyProgressSummary } from '@/components/academy/AcademyProgressSummary';
import { AcademyStatusDistribution } from '@/components/academy/AcademyStatusDistribution';

const isValidIsoInputDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const toSpanishDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

const toIsoDate = (date: Date | number | string): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const getPastDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toIsoDate(d);
};

const mapAnalyticsErrorMessage = (error: string): string => {
  const low = error.toLowerCase();
  if (low.includes('no autorizado') || low.includes('permisos')) {
    return 'No tienes permisos para consultar esta analítica.';
  }
  const genericErrors = ['schema cache', 'could not find the table', 'formato de fecha inválido', 'invalid', 'error al consultar'];
  if (genericErrors.some(ge => low.includes(ge))) {
    return 'La analítica no está disponible temporalmente.';
  }
  return 'No se pudo cargar la analítica.';
};

export default function AcademyProgressClient({ academy, totalVocabulary }: AcademyProgressClientProps) {
  const { favorites, status: statusMap, quizStats, resetData } = useAcademyProgress();
  const [pendingReset, setPendingReset] = useState<'quiz' | 'status' | 'favorites' | 'all' | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const today = useMemo(() => toIsoDate(new Date()), []);
  const [draftRange, setDraftRange] = useState({ from: getPastDate(30), to: today });
  const [appliedRange, setAppliedRange] = useState({ from: getPastDate(30), to: today });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [localAnalyticsValidationError, setLocalAnalyticsValidationError] = useState('');
  const [analyticsSummary, setAnalyticsSummary] = useState<StudentAnalyticsSummary | null>(null);

  const minAllowedDate = analyticsSummary?.membershipStartedAt ? toIsoDate(analyticsSummary.membershipStartedAt) : '';

  const fetchAnalytics = useCallback(async (rangeToUse: { from: string; to: string }) => {
    setAnalyticsError('');
    setLocalAnalyticsValidationError('');
    setAnalyticsLoading(true);

    try {
      const data = await getOwnAnalyticsSummaryAction(
        academy.id, 
        toSpanishDate(rangeToUse.from), 
        toSpanishDate(rangeToUse.to)
      );
      
      setAnalyticsSummary(data);

      const actualMin = toIsoDate(data.membershipStartedAt);
      if (actualMin) {
        let correctedFrom = rangeToUse.from;
        let correctedTo = rangeToUse.to;
        let needsUpdate = false;

        if (correctedFrom < actualMin) {
          correctedFrom = actualMin;
          needsUpdate = true;
        }
        if (correctedTo < actualMin) {
          correctedTo = actualMin;
          needsUpdate = true;
        }
        if (correctedTo < correctedFrom) {
          correctedTo = correctedFrom;
          needsUpdate = true;
        }

        if (needsUpdate) {
          const newRange = { from: correctedFrom, to: correctedTo };
          setDraftRange(newRange);
          setAppliedRange(newRange);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setAnalyticsError(mapAnalyticsErrorMessage(message));
    } finally {
      setAnalyticsLoading(false);
    }
  }, [academy.id]);

  useEffect(() => {
    fetchAnalytics(appliedRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAnalytics]);

  const handleApplyAnalytics = () => {
    if (!isValidIsoInputDate(draftRange.from) || !isValidIsoInputDate(draftRange.to)) {
      setAnalyticsError('');
      setLocalAnalyticsValidationError('Revisa el rango de fechas.');
      return;
    }

    let from = draftRange.from;
    let to = draftRange.to;

    if (minAllowedDate) {
      if (from < minAllowedDate) from = minAllowedDate;
      if (to < minAllowedDate) to = minAllowedDate;
    }
    
    if (to > today) to = today;
    if (from > today) from = today;
    if (to < from) to = from;

    const newRange = { from, to };
    setDraftRange(newRange);
    setAppliedRange(newRange);
    setLocalAnalyticsValidationError('');
    fetchAnalytics(newRange);
  };

  const statCounts = {
    new: Object.values(statusMap).filter(s => s === 'new').length,
    seen: Object.values(statusMap).filter(s => s === 'seen').length,
    learned: Object.values(statusMap).filter(s => s === 'learned').length,
  };

  const { correct, incorrect, total } = quizStats;
  const winRate = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleReset = (type: 'all' | 'quiz' | 'favorites' | 'status') => {
    setPendingReset(type);
  };

  const confirmReset = () => {
    if (pendingReset) {
      resetData(pendingReset);
      setPendingReset(null);
    }
  };

  const resetMessages = {
    all: '¿Estás completamente seguro de borrar TODOS tus datos de esta academia? Perderás favoritos, progreso y estadísticas del quiz. Esta acción no se puede deshacer.',
    quiz: '¿Borrar solo las estadísticas del Quiz de esta academia?',
    favorites: '¿Borrar todas tus palabras favoritas de esta academia?',
    status: '¿Borrar el progreso de palabras vistas y aprendidas de esta academia?'
  };

  const primaryBg = { backgroundColor: 'var(--academy-primary, #6366f1)' };
  const primaryText = { color: 'var(--academy-primary, #6366f1)' };

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50/50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors pb-24">
      <header className="sticky top-12 z-20 bg-gray-50/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-4 pt-6 pb-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
          <div className="p-1.5 rounded-xl text-white shadow-sm" style={primaryBg}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
          </div>
          Progreso
        </h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        <AcademyProgressSummary 
          favoritesCount={favorites.length}
          seenCount={statCounts.seen}
          learnedCount={statCounts.learned}
          totalVocabulary={totalVocabulary}
          quizCorrect={quizStats.correct}
          quizIncorrect={quizStats.incorrect}
          quizTotal={quizStats.total}
        />

        <button 
          onClick={() => setShowAnalyticsModal(true)}
          className="w-full p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-gray-50 dark:hover:bg-slate-700/50"
        >
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-1">Analítica Avanzada</h2>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-1">Actividad y progreso por rango de fechas</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-slate-900 rounded-2xl text-gray-400 group-hover:text-[var(--academy-primary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </button>

        <AcademyStatusDistribution 
          newCount={Math.max(0, totalVocabulary - statCounts.seen - statCounts.learned)}
          seenCount={statCounts.seen}
          learnedCount={statCounts.learned}
          totalVocabulary={totalVocabulary}
        />


        <section>
          <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-3">Estadísticas de Quiz</h2>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700">
            
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-700 pb-5">
              <div>
                <p className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Acierto Global</p>
                <div className="flex items-end gap-1" style={primaryText}>
                  <span className="text-4xl font-black leading-none">{winRate}</span>
                  <span className="text-xl font-bold">%</span>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Respondidas</p>
                 <span className="text-2xl font-black text-gray-700 dark:text-gray-300 leading-none">{total}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Aciertos</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{correct}</span>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Fallos</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{incorrect}</span>
               </div>
            </div>

            {total > 0 && (
              <div className="w-full h-3 flex bg-gray-100 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                <div style={{ width: `${winRate}%` }} className="h-full bg-green-500 transition-all"></div>
                <div style={{ width: `${100 - winRate}%` }} className="h-full bg-red-500 transition-all"></div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest pl-1 mb-3 mt-8">Zona de Peligro</h2>
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-3xl border border-red-100 dark:border-red-900/30 space-y-3">
             {pendingReset ? (
               <InlineConfirm 
                 message={resetMessages[pendingReset]}
                 onConfirm={confirmReset}
                 onCancel={() => setPendingReset(null)}
               />
             ) : (
               <>
                 <button 
                  type="button"
                  onClick={() => handleReset('quiz')}
                  className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-all hover:border-red-200 dark:hover:border-red-900"
                >
                  Resetear Estadísticas de Quiz
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
                <button 
                  type="button"
                  onClick={() => handleReset('status')}
                  className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-all hover:border-red-200 dark:hover:border-red-900"
                >
                  Resetear Etiquetas (Vistas / Aprendidas)
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
                <button 
                  type="button"
                  onClick={() => handleReset('favorites')}
                  className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-all hover:border-red-200 dark:hover:border-red-900"
                >
                  Borrar Todas las Favoritas
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
                <button 
                  type="button"
                  onClick={() => handleReset('all')}
                  className="w-full text-left px-4 py-4 bg-red-500 text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-black shadow-sm active:scale-[0.98] transition-all hover:bg-red-600 mt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  Borrar Absolutamente Todo
                </button>
               </>
             )}
          </div>
        </section>
      </div>

      {showAnalyticsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAnalyticsModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">Analítica Avanzada</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Actividad por rango de fechas</p>
              </div>
              <button 
                onClick={() => setShowAnalyticsModal(false)}
                className="p-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:text-rose-500 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
              {/* Range Selector */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                <AcademyAnalyticsDateRangeForm
                  from={draftRange.from}
                  to={draftRange.to}
                  minFrom={minAllowedDate}
                  maxTo={today}
                  applyDisabled={analyticsLoading}
                  onChange={(range) => {
                    setLocalAnalyticsValidationError('');
                    setDraftRange(range);
                  }}
                  onApply={handleApplyAnalytics}
                />
                {minAllowedDate && (
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 pl-1 uppercase tracking-tight">
                    Disponible desde: {toSpanishDate(minAllowedDate)}
                  </p>
                )}
                {localAnalyticsValidationError && (
                  <p className="text-xs font-bold text-rose-500 pl-1">{localAnalyticsValidationError}</p>
                )}
              </div>

              {analyticsLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--academy-primary)] rounded-full animate-spin shadow-inner"></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 animate-pulse">Consultando analítica...</span>
                </div>
              ) : analyticsError ? (
                <div className="p-8 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-2xl border border-rose-100 dark:border-rose-900/50 flex flex-col items-center gap-4 text-center">
                  <p className="max-w-[280px]">{analyticsError}</p>
                  <button 
                    onClick={() => fetchAnalytics(appliedRange)}
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-black shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95"
                  >
                    Reintentar
                  </button>
                </div>
              ) : analyticsSummary && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Vistas', value: analyticsSummary.wordsSeenInRange, color: 'text-blue-500' },
                      { label: 'Aprendidas', value: analyticsSummary.wordsLearnedInRange, color: 'text-emerald-500' },
                      { label: 'Correctas', value: analyticsSummary.quizCorrect, color: 'text-green-500' },
                      { label: 'Incorrectas', value: analyticsSummary.quizIncorrect, color: 'text-rose-500' },
                    ].map((stat, i) => (
                      <div key={i} className="p-5 rounded-3xl border border-gray-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 shadow-sm">
                        <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">{stat.label}</div>
                        <div className={`text-3xl font-black tabular-nums ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <AcademyAnalyticsBarChart 
                    favoritesAdded={analyticsSummary.favoritesAdded}
                    favoritesRemoved={analyticsSummary.favoritesRemoved}
                    wordsSeenInRange={analyticsSummary.wordsSeenInRange}
                    wordsLearnedInRange={analyticsSummary.wordsLearnedInRange}
                    quizAnswered={analyticsSummary.quizAnswered}
                    quizCorrect={analyticsSummary.quizCorrect}
                    quizIncorrect={analyticsSummary.quizIncorrect}
                  />

                  <div className="bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Basado en eventos de aprendizaje ({toSpanishDate(appliedRange.from)} - {toSpanishDate(appliedRange.to)})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
