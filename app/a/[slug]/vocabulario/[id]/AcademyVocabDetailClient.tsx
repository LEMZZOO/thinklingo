'use client';

import { useAppContext } from '@/components/AppProvider';
import { Academy } from '@/types/academy';
import { VocabularyEntry } from '@/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CATEGORY_LABELS: Record<string, string> = {
  adjectives: 'Adjetivos',
  communication: 'Comunicación',
  connectors: 'Conectores',
  'daily-life': 'Vida diaria',
  emotions: 'Emociones',
  expressions: 'Expresiones',
  food: 'Comida',
  health: 'Salud',
  home: 'Hogar',
  people: 'Personas',
  shopping: 'Compras',
  study: 'Estudio',
  technology: 'Tecnología',
  time: 'Tiempo',
  travel: 'Viajes',
  verbs: 'Verbos',
  work: 'Trabajo',
};

function getCategoryLabel(category?: string | null) {
  if (!category || !category.trim()) return 'Sin categoría';
  const cat = category.trim();
  if (cat === '_uncategorized') return 'Sin categoría';
  return CATEGORY_LABELS[cat] ?? cat;
}

interface Props {
  academy: Academy;
  entry: VocabularyEntry;
}

export default function AcademyVocabDetailClient({ academy, entry }: Props) {
  const { getProgress, setStatus, toggleFavorite, isMounted } = useAppContext();
  const searchParams = useSearchParams();
  
  if (!isMounted) return null;

  const progress = getProgress(academy.slug);
  const isFav = progress.favorites.includes(entry.id);
  const status = progress.status[entry.id] || 'new';

  const primaryBg = { backgroundColor: 'var(--academy-primary, #6366f1)' };
  const primaryText = { color: 'var(--academy-primary, #6366f1)' };

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors">
      {/* Top Header */}
      <header className="sticky top-12 z-20 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center gap-4">
        <Link 
          href={`/a/${academy.slug}/vocabulario${searchParams.toString() ? '?' + searchParams.toString() : ''}`}
          aria-label="Volver a la lista"
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span className="font-bold text-sm tracking-widest uppercase text-slate-400">Detalle de Palabra</span>
      </header>

      <div className="max-w-2xl mx-auto p-6 md:py-10 space-y-8">
        {/* Main Word Card */}
        <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800/80 text-center relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-full h-2" style={primaryBg}></div>
          
          <div className="mb-6 flex justify-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-500">
               {getCategoryLabel(entry.category)}
             </span>
             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                entry.difficulty === 'easy' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' :
                entry.difficulty === 'medium' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600' :
                'bg-rose-50 dark:bg-rose-950/30 text-rose-600'
             }`}>
               Dificultad: {entry.difficulty || 'normal'}
             </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-4" style={primaryText}>
            {entry.english_word}
          </h1>
          <p className="text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-400">
            {entry.spanish_translation}
          </p>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800/50 flex flex-col sm:flex-row gap-3 justify-center">
             <button
               onClick={() => toggleFavorite(academy.slug, entry.id)}
               className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                 isFav 
                   ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500 shadow-sm border border-amber-200 dark:border-amber-800'
                   : 'bg-gray-50 dark:bg-slate-800 text-slate-400 border border-gray-100 dark:border-slate-700 hover:text-amber-500'
               }`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               {isFav ? 'En Favoritos' : 'Añadir a Favoritos'}
             </button>
             
             <div className="flex bg-gray-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700">
               <button
                 onClick={() => setStatus(academy.slug, entry.id, 'new')}
                 className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   status === 'new' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                 }`}
               >
                 Nueva
               </button>
               <button
                 onClick={() => setStatus(academy.slug, entry.id, 'seen')}
                 className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   status === 'seen' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-blue-500'
                 }`}
               >
                 Vista
               </button>
               <button
                 onClick={() => setStatus(academy.slug, entry.id, 'learned')}
                 className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   status === 'learned' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500 hover:text-green-500'
                 }`}
               >
                 Aprendida
               </button>
             </div>
          </div>
        </section>

        {/* Examples Section */}
        {((entry.example_sentence_en) || (entry.example_sentence_es) || (entry.note)) && (
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800/80 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Contexto y Ejemplos</h2>
            
            {((entry.example_sentence_en) || (entry.example_sentence_es)) && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                {(entry.example_sentence_en) && (
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    "{entry.example_sentence_en}"
                  </p>
                )}
                {(entry.example_sentence_es) && (
                  <p className="text-md font-medium text-slate-500 dark:text-slate-400 italic">
                    "{entry.example_sentence_es}"
                  </p>
                )}
              </div>
            )}

            {(entry.note) && (
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Nota adicional
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {entry.note}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
