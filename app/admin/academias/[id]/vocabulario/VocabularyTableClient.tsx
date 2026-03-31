'use client';

import { useState, useMemo } from 'react';
import { AcademyVocabularyRow } from '@/types/academy';
import { EditableVocabularyRow } from './EditableVocabularyRow';

interface VocabularyTableClientProps {
  dbRows: AcademyVocabularyRow[];
  academyId: string;
}

export function VocabularyTableClient({ dbRows, academyId }: VocabularyTableClientProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [query, setQuery] = useState('');

  const rowIndexMap = useMemo(() => new Map(dbRows.map((row, index) => [row.id, index])), [dbRows]);

  const filteredRows = dbRows.filter((row) => {
    // 1. Filtro por estado
    if (filter === 'active' && !row.is_active) return false;
    if (filter === 'inactive' && row.is_active) return false;

    // 2. Filtro por texto
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const matchEn = row.english_word.toLowerCase().includes(q);
      const matchEs = row.spanish_translation.toLowerCase().includes(q);
      const matchCat = row.category?.toLowerCase().includes(q) ?? false;
      
      if (!matchEn && !matchEs && !matchCat) return false;
    }

    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 min-w-max">
          Mostrando {filteredRows.length} de {dbRows.length} entradas
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Input Búsqueda */}
          <div className="relative w-full sm:w-72">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Buscar palabra, traducción o categoría..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[11px] font-bold tracking-wide bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-shadow"
            />
          </div>

          {/* Tabs de Filtro */}
          <div className="flex p-1 bg-gray-100 dark:bg-slate-800/80 rounded-xl w-full sm:w-auto">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all ${
                  filter === f
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Inactivas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-800/30">
              <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3">Inglés</th>
              <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3">Español</th>
              <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Categoría</th>
              <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Dificultad</th>
              <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Estado</th>
              <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center bg-white dark:bg-slate-900">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    No hay palabras que coincidan con el filtro.
                  </p>
                </td>
              </tr>
            ) : (
              filteredRows.map((entry) => {
                const originalIndex = rowIndexMap.get(entry.id) ?? 0;
                return (
                  <EditableVocabularyRow
                    key={entry.id}
                    row={entry}
                    academyId={academyId}
                    isFirst={originalIndex === 0}
                    isLast={originalIndex === dbRows.length - 1}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
