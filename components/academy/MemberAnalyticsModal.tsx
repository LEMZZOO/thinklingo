'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AcademyAnalyticsBarChart } from './AcademyAnalyticsBarChart';
import { AcademyAnalyticsDateRangeForm } from './AcademyAnalyticsDateRangeForm';
import { getMemberAnalyticsSummaryAction } from '@/app/(private)/a/[slug]/miembros/actions';
import { StudentAnalyticsSummary } from '@/types/academy-analytics';

interface Props {
  open: boolean;
  onClose: () => void;
  academyId: string;
  memberUserId: string;
  memberName: string;
  memberRole: 'student' | 'teacher' | 'academy_admin';
}

/**
 * Mapea errores técnicos a mensajes amigables para el usuario.
 */
function mapAnalyticsErrorMessage(error: string): string {
  const low = error.toLowerCase();
  if (low.includes('no autorizado') || low.includes('permisos')) {
    return 'No tienes permisos para consultar esta analítica.';
  }
  if (
    low.includes('schema cache') ||
    low.includes('could not find the table') ||
    low.includes('formato de fecha inválido') ||
    low.includes('invalid') ||
    low.includes('error al consultar')
  ) {
    return 'La analítica no está disponible temporalmente.';
  }
  return 'No se pudo cargar la analítica.';
}

/**
 * Valida si una fecha tiene el formato YYYY-MM-DD.
 */
function isValidIsoInputDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Convierte YYYY-MM-DD a DD/MM/YYYY para el servicio.
 */
function toSpanishDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Genera fecha en formato YYYY-MM-DD a partir de un objeto Date o ms.
 */
function toIsoDate(date: Date | number | string): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Genera fecha de hace N días en formato YYYY-MM-DD.
 */
function getPastDate(days: number): string {
  return toIsoDate(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function MemberAnalyticsModal({ open, onClose, academyId, memberUserId, memberName, memberRole }: Props) {
  const today = useMemo(() => toIsoDate(new Date()), []);

  const [draftRange, setDraftRange] = useState({
    from: getPastDate(30),
    to: today
  });

  const [appliedRange, setAppliedRange] = useState(draftRange);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localValidationError, setLocalValidationError] = useState('');
  const [summary, setSummary] = useState<StudentAnalyticsSummary | null>(null);

  const minAllowedDate = useMemo(() =>
    summary?.membershipStartedAt ? toIsoDate(summary.membershipStartedAt) : '',
    [summary]);

  const fetchData = useCallback(async (rangeToUse: { from: string; to: string }) => {
    if (memberRole !== 'student') return;
    setLoading(true);
    setError('');
    setLocalValidationError('');
    try {
      const data = await getMemberAnalyticsSummaryAction(
        academyId,
        memberUserId,
        toSpanishDate(rangeToUse.from),
        toSpanishDate(rangeToUse.to)
      );
      setSummary(data);

      // Clamp al conocer la fecha de alta real
      const actualMin = toIsoDate(data.membershipStartedAt);
      if (actualMin) {
        let needsUpdate = false;
        let cFrom = rangeToUse.from;
        let cTo = rangeToUse.to;
        if (cFrom < actualMin) { cFrom = actualMin; needsUpdate = true; }
        if (cTo < actualMin) { cTo = actualMin; needsUpdate = true; }
        if (cTo < cFrom) { cTo = cFrom; needsUpdate = true; }

        if (needsUpdate) {
          const newR = { from: cFrom, to: cTo };
          setAppliedRange(newR);
          setDraftRange(newR);
        }
      }
    } catch (err: unknown) {
      setError(mapAnalyticsErrorMessage(err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [academyId, memberUserId, memberRole]);

  useEffect(() => {
    if (open && memberRole === 'student') fetchData(appliedRange);
  }, [open, memberRole, fetchData]);

  const handleApply = () => {
    if (!isValidIsoInputDate(draftRange.from) || !isValidIsoInputDate(draftRange.to)) {
      setError('');
      setLocalValidationError('Revisa el rango de fechas.');
      return;
    }

    setLocalValidationError('');
    let fFrom = draftRange.from;
    let fTo = draftRange.to;

    if (minAllowedDate) {
      if (fFrom < minAllowedDate) fFrom = minAllowedDate;
      if (fTo < minAllowedDate) fTo = minAllowedDate;
    }

    if (fTo > today) fTo = today;
    if (fFrom > today) fFrom = today;
    if (fFrom > fTo) fTo = fFrom;

    const nR = { from: fFrom, to: fTo };
    setDraftRange(nR);
    setAppliedRange(nR);
    fetchData(nR);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{memberName}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Analítica de Progreso</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:text-rose-500 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          {memberRole !== 'student' ? (
            <div className="p-12 text-center bg-gray-50 dark:bg-slate-950/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800">
              <div className="text-slate-400 font-black text-sm uppercase tracking-wider mb-2">Acceso No Disponible</div>
              <p className="text-slate-500 text-xs">La analítica está disponible exclusivamente para alumnos.</p>
            </div>
          ) : (
            <>
              {/* Selector de Rango */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                <AcademyAnalyticsDateRangeForm
                  from={draftRange.from}
                  to={draftRange.to}
                  minFrom={minAllowedDate}
                  maxTo={today}
                  applyDisabled={loading}
                  onChange={setDraftRange}
                  onApply={handleApply}
                />

                {minAllowedDate && (
                  <p className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-wider">
                    Disponible desde: {toSpanishDate(minAllowedDate)}
                  </p>
                )}

                {localValidationError && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                      {localValidationError}
                    </p>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--academy-primary)] rounded-full animate-spin shadow-inner"></div>
                  <span className="text-[9px] font-black uppercase text-slate-400 animate-pulse">Consultando historial...</span>
                </div>
              ) : error ? (
                <div className="p-8 bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-sm font-bold rounded-2xl border border-rose-100 dark:border-rose-900/50 flex flex-col items-center gap-3 shadow-inner text-center">
                  <p className="max-w-[280px] mx-auto">{error}</p>
                  <button
                    onClick={() => fetchData(appliedRange)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border-rose-200 mt-4 rounded-xl text-rose-600 dark:text-rose-400 text-xs shadow-sm hover:bg-rose-100 transition-colors font-bold"
                  >
                    Reintentar
                  </button>
                </div>
              ) : summary ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Seen', value: summary.wordsSeenInRange, color: 'text-blue-500' },
                      { label: 'Learned', value: summary.wordsLearnedInRange, color: 'text-indigo-500' },
                      { label: 'Quiz Correct', value: summary.quizCorrect, color: 'text-emerald-500' },
                      { label: 'Quiz Incorrect', value: summary.quizIncorrect, color: 'text-rose-500' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-3xl border border-gray-100 dark:border-slate-800 bg-slate-50/30">
                        <div className="text-[9px] font-black uppercase text-slate-400 mb-1">{stat.label}</div>
                        <div className={`text-2xl font-black tabular-nums ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <AcademyAnalyticsBarChart {...summary} />
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-center mt-auto">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center">
            Basado en eventos de aprendizaje ({toSpanishDate(appliedRange.from)} - {toSpanishDate(appliedRange.to)})
          </p>
        </div>
      </div>
    </div>
  );
}
