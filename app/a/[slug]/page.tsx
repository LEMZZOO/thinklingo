import { getAcademyBySlug } from '@/services/academies';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AcademyPage({
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
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen pb-16">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* Banner with Dynamic Branding */}
        <div className="h-32 w-full bg-(--academy-secondary) relative flex items-center justify-center">
            {academy.logo_url ? (
                <div className="absolute -bottom-10 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
                    <img src={academy.logo_url} alt={academy.name} className="w-20 h-20 object-contain" />
                </div>
            ) : (
                <div className="absolute -bottom-10 bg-(--academy-primary) text-white p-4 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900 font-black text-2xl uppercase italic tracking-tighter w-20 h-20 flex items-center justify-center">
                    {academy.name.slice(0, 2)}
                </div>
            )}
        </div>

        <div className="pt-16 pb-10 px-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {academy.name}
            </h1>
            {academy.headline && (
                <p className="text-xl font-bold text-(--academy-primary)">
                  {academy.headline}
                </p>
            )}
            {academy.tagline && (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                  "{academy.tagline}"
                </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square bg-(--academy-primary) rounded-2xl shadow-sm shadow-black/10"></div>
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">Primario</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square bg-(--academy-secondary) rounded-2xl shadow-sm shadow-black/10"></div>
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">Secundario</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square bg-(--academy-accent) rounded-2xl shadow-sm shadow-black/10"></div>
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">Acento</span>
              </div>
          </div>

          <Link 
            href={`/a/${slug}/vocabulario`}
            className="block w-full py-4 bg-(--academy-primary) hover:brightness-110 text-white font-bold rounded-2xl shadow-lg shadow-(--academy-primary)/20 transition-all active:scale-[0.98] mt-4 uppercase tracking-wider text-sm text-center"
          >
            Entrar a la Academia
          </Link>
        </div>
      </div>
    </main>
  );
}
