'use client';

import { useActionState, useRef, useEffect } from 'react';
import { addVocabEntry } from './actions';

interface AddWordFormProps {
  academyId: string;
}

const initialState: { ok: boolean; error: string | undefined } = { ok: false, error: undefined };

export function AddWordForm({ academyId }: AddWordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const action = async (
    _prev: typeof initialState,
    formData: FormData
  ): Promise<typeof initialState> => addVocabEntry(academyId, formData);

  const [state, formAction, isPending] = useActionState(action, initialState);

  // Reset form on successful submission
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Añadir palabra
        </h2>
      </div>

      <form ref={formRef} action={formAction} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="english_word" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Inglés <span className="text-rose-400">*</span>
            </label>
            <input
              id="english_word"
              name="english_word"
              type="text"
              required
              placeholder="apple"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="spanish_translation" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Español <span className="text-rose-400">*</span>
            </label>
            <input
              id="spanish_translation"
              name="spanish_translation"
              type="text"
              required
              placeholder="manzana"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="example_sentence_en" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Ejemplo (EN)
            </label>
            <input
              id="example_sentence_en"
              name="example_sentence_en"
              type="text"
              placeholder="I eat an apple every day."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="example_sentence_es" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Ejemplo (ES)
            </label>
            <input
              id="example_sentence_es"
              name="example_sentence_es"
              type="text"
              placeholder="Como una manzana cada día."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Categoría
            </label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="food"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="difficulty" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Dificultad
            </label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue="medium"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
            >
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        </div>

        {state.error && (
          <p className="text-xs font-bold text-rose-500 px-1">
            ⚠️ {state.error}
          </p>
        )}

        {state.ok && (
          <p className="text-xs font-bold text-emerald-500 px-1">
            ✓ Palabra añadida correctamente.
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isPending ? 'Añadiendo...' : 'Añadir palabra'}
          </button>
        </div>
      </form>
    </div>
  );
}
