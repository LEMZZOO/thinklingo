import { getAcademyBySlug } from '@/services/academies';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AcademyVocabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  return (
    <main className="flex-1 flex flex-col p-6 min-h-screen">
      {/* Header Académico */}
      <header className="flex items-center justify-between mb-8 animate-in slide-in-from-top duration-500">
        <Link href={`/a/${slug}`} className="group flex items-center gap-3">
          <div className="w-10 h-10 bg-(--academy-primary) rounded-xl flex items-center justify-center shadow-lg shadow-(--academy-primary)/20 group-hover:scale-110 transition-transform">
             {academy.logo_url ? (
                <img src={academy.logo_url} alt={academy.name} className="w-6 h-6 object-contain" />
             ) : (
                <span className="text-white font-black text-sm uppercase italic">{academy.name.slice(0, 2)}</span>
             )}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
              {academy.name}
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
              Lista de Vocabulario
            </p>
          </div>
        </Link>

        <Link 
          href={`/a/${slug}`}
          className="text-xs font-bold text-slate-400 hover:text-(--academy-primary) transition-colors"
        >
          Volver a Inicio
        </Link>
      </header>

      {/* Contenido Placeholder Cuidado */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-0 animate-in fade-in fill-mode-forwards delay-300 duration-1000">
        <div className="relative">
            <div className="absolute inset-0 bg-(--academy-primary) blur-3xl opacity-10 rounded-full animate-pulse"></div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="64" height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-(--academy-primary) relative"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M8 7h6"/>
              <path d="M8 11h8"/>
            </svg>
        </div>
        
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            Estamos preparando tu lista
          </h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Muy pronto podrás acceder a todo el contenido exclusivo diseñado por <span className="text-(--academy-primary) font-bold">{academy.name}</span> para acelerar tu aprendizaje.
          </p>
        </div>

        <div className="w-full max-w-xs h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-(--academy-primary) w-1/3 rounded-full animate-[progress_3s_ease-in-out_infinite]"></div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </main>
  );
}
