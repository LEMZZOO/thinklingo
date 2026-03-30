import { getAllVocabulary } from '@/lib/vocabulary';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClientDetailControls from '@/components/ClientDetailControls';

export async function generateStaticParams() {
  const vocab = getAllVocabulary();
  return vocab.map((v) => ({
    id: v.id,
  }));
}

export default async function VocabDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vocab = getAllVocabulary();
  const entry = vocab.find(v => v.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 pb-20 transition-colors">
      <header className="mb-6 sticky top-0 pt-4 pb-2 bg-gray-50/90 dark:bg-[#0f172a]/90 z-20 backdrop-blur-md">
        <Link 
          href="/vocabulario" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700/80 px-4 py-2.5 rounded-2xl hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-600 active:scale-95 transition-all font-bold text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver al Listado
        </Link>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8 space-y-8 relative overflow-hidden transition-colors">
        {/* Decorative subtle background circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-2xl z-0" />
        
        <div className="relative z-10">
          <div className="flex gap-2 items-center mb-4">
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1.5 rounded-lg uppercase tracking-widest">{entry.category}</span>
            <span className={`text-[10px] px-2.5 py-1.5 rounded-lg font-extrabold uppercase tracking-widest ${
              entry.difficulty === 'easy' ? 'bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 
              entry.difficulty === 'medium' ? 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' : 
              'bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-400'
            }`}>
              {entry.difficulty}
            </span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">{entry.english_word}</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-semibold mt-2">{entry.spanish_translation}</p>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-gray-100/80 dark:border-slate-700/80 text-left">
            <h3 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              En Contexto
            </h3>
            <p className="text-[1.1rem] text-gray-800 dark:text-gray-200 font-medium leading-relaxed">"{entry.example_sentence_en}"</p>
          </div>
          
          <div className="bg-blue-50/40 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100/50 dark:border-blue-800/30 text-left">
            <h3 className="text-[10px] font-extrabold text-blue-400 dark:text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
              Traducción
            </h3>
            <p className="text-[1.1rem] text-blue-900/90 dark:text-blue-200 font-medium leading-relaxed">"{entry.example_sentence_es}"</p>
          </div>
        </div>

        {(entry.tags.length > 0 || entry.note) && (
          <div className="relative z-10 space-y-6 pt-2 border-t border-gray-100 dark:border-slate-800">
            {entry.tags.length > 0 && (
              <div>
                <h3 className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200/60 dark:border-slate-700 text-[11px] px-3 py-1.5 rounded-lg font-bold">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {entry.note && (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
                <h3 className="text-[10px] font-extrabold text-amber-500 dark:text-amber-600 uppercase tracking-widest mb-1">Nota del Autor</h3>
                <p className="text-sm text-amber-800/80 dark:text-amber-500/80 font-medium leading-relaxed">{entry.note}</p>
              </div>
            )}
          </div>
        )}

        <ClientDetailControls id={entry.id} />
      </div>
    </main>
  );
}
