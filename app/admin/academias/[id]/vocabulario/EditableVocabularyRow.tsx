'use client';

import { useState } from 'react';
import { AcademyVocabularyRow } from '@/types/academy';
import { toggleVocabularyStatus, updateAcademyVocabularyWord, moveVocabularyItem } from './actions';

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Media',
  advanced: 'Avanzado',
};

interface EditableVocabularyRowProps {
  row: AcademyVocabularyRow;
  academyId: string;
  isFirst: boolean;
  isLast: boolean;
}

export function EditableVocabularyRow({ row, academyId, isFirst, isLast }: EditableVocabularyRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [enWord, setEnWord] = useState(row.english_word);
  const [esWord, setEsWord] = useState(row.spanish_translation);

  const handleCancel = () => {
    setEnWord(row.english_word);
    setEsWord(row.spanish_translation);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50/30 dark:bg-blue-900/10 transition-colors">
        <td colSpan={6} className="p-0">
          <form action={updateAcademyVocabularyWord} className="flex items-center w-full px-2 py-2">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="academyId" value={academyId} />
            
            <div className="flex-1 flex items-center gap-4 px-4">
              {/* Inglés */}
              <div className="flex-1 max-w-[250px]">
                <input
                  name="english_word"
                  value={enWord}
                  onChange={(e) => setEnWord(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Inglés"
                  autoFocus
                  required
                />
              </div>

              {/* Español */}
              <div className="flex-1 max-w-[250px]">
                <input
                  name="spanish_translation"
                  value={esWord}
                  onChange={(e) => setEsWord(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Español"
                  required
                />
              </div>

              {/* Readonly info for context */}
              <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest px-4">
                {row.category ? (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">
                    {row.category}
                  </span>
                ) : (
                  <span className="text-slate-300 dark:text-slate-700">—</span>
                )}
                <span className={`px-2 py-1 rounded-lg ${
                  row.difficulty === 'easy'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : row.difficulty === 'medium'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                }`}>
                  {DIFFICULTY_LABELS[row.difficulty] ?? row.difficulty}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="submit"
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors ${!row.is_active ? 'opacity-50' : ''}`}>
      {/* Inglés */}
      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 min-w-[200px]">
        {row.english_word}
        {!row.is_active && (
          <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Inactivo
          </span>
        )}
      </td>

      {/* Español */}
      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 min-w-[200px]">
        {row.spanish_translation}
      </td>

      {/* Categoría */}
      <td className="px-4 py-4">
        {row.category ? (
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">
            {row.category}
          </span>
        ) : (
          <span className="text-slate-300 dark:text-slate-700">—</span>
        )}
      </td>

      {/* Dificultad */}
      <td className="px-4 py-4">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
          row.difficulty === 'easy'
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : row.difficulty === 'medium'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
        }`}>
          {DIFFICULTY_LABELS[row.difficulty] ?? row.difficulty}
        </span>
      </td>

      {/* Estado */}
      <td className="px-4 py-4">
        <span className={`w-2 h-2 rounded-full inline-block ${row.is_active ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
      </td>

      {/* Acciones */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Editar
          </button>
          
          <form action={toggleVocabularyStatus}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="academyId" value={academyId} />
            <button
              type="submit"
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors border ${
                row.is_active
                  ? 'border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              {row.is_active ? 'Desact' : 'Act'}
            </button>
          </form>

          {/* Ordenación */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {!isFirst && (
              <form action={moveVocabularyItem}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="academyId" value={academyId} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  className="p-1 rounded bg-transparent hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shadow-sm"
                  title="Subir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                </button>
              </form>
            )}
            {!isLast && (
               <form action={moveVocabularyItem}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="academyId" value={academyId} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  className="p-1 rounded bg-transparent hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shadow-sm"
                  title="Bajar"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
