import { getAcademyById } from '@/services/academies';
import {
  getAcademyVocabularySource,
  getAllAcademyVocabulary,
  toVocabularyEntry,
  getActiveAcademyVocabulary,
} from '@/services/academyVocabulary';
import { getAllVocabulary } from '@/lib/vocabulary';
import { notFound } from 'next/navigation';
import { VocabularyEntry } from '@/types';
import { AcademyVocabularyRow } from '@/types/academy';
import { AddWordForm } from './AddWordForm';
import { EditableVocabularyRow } from './EditableVocabularyRow';
import { VocabularyTableClient } from './VocabularyTableClient';
import { toggleVocabularyStatus } from './actions';

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Media',
  advanced: 'Avanzado',
};

export default async function AcademyVocabAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const academy = await getAcademyById(id);

  if (!academy) {
    notFound();
  }

  const source = getAcademyVocabularySource(academy);

  // Admin siempre muestra todos (activos + inactivos) para fuente DB.
  // Para JSON, mostramos el vocab global como referencia (solo lectura).
  const dbRows: AcademyVocabularyRow[] =
    source === 'db' ? await getAllAcademyVocabulary(id) : [];
  const jsonEntries: VocabularyEntry[] =
    source === 'json' ? getAllVocabulary() : [];

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <a
                href={`/admin/academias/${id}`}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                {academy.name}
              </a>
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Vocabulario de Academia
            </h1>
          </div>

          {/* Badge de modo */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${
            academy.uses_custom_vocabulary
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              academy.uses_custom_vocabulary ? 'bg-emerald-500' : 'bg-amber-400'
            }`} />
            {academy.uses_custom_vocabulary
              ? 'Vocabulario propio activo'
              : 'Usando vocabulario global (JSON)'}
          </div>
        </div>

        {/* Notice: modo JSON */}
        {!academy.uses_custom_vocabulary && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 flex gap-4 items-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <div>
              <p className="text-sm font-black text-amber-800 dark:text-amber-300">Esta academia usa el vocabulario global</p>
              <p className="text-xs font-bold text-amber-600/80 dark:text-amber-400/60 mt-1">
                Para activar vocabulario propio, edita la academia y activa el flag <code className="bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded font-mono">uses_custom_vocabulary</code>.
              </p>
            </div>
          </div>
        )}

        {/* Formulario añadir — solo en modo DB */}
        {source === 'db' && <AddWordForm academyId={id} />}

        {/* TABLA: modo DB */}
        {source === 'db' && (
          dbRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-700 mb-5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h2 className="text-lg font-black text-slate-600 dark:text-slate-400 mb-2">Sin vocabulario propio</h2>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest max-w-xs">
                Esta academia todavía no tiene ninguna entrada en la base de datos.
              </p>
            </div>
          ) : (
            <VocabularyTableClient dbRows={dbRows} academyId={id} />
          )

        )}

        {/* TABLA: modo JSON (solo lectura) */}
        {source === 'json' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {jsonEntries.length} palabras globales (solo lectura)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/30">
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3">Inglés</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-3">Español</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Categoría</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-3">Dificultad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {jsonEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{entry.english_word}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{entry.spanish_translation}</td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                          entry.difficulty === 'easy'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : entry.difficulty === 'medium'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}>
                          {DIFFICULTY_LABELS[entry.difficulty] ?? entry.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
