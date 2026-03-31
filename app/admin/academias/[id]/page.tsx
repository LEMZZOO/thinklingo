import { getAcademyById } from '@/services/academies';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AcademiaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const academy = await getAcademyById(id);

  if (!academy) {
    notFound();
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-2xl mx-auto w-full space-y-8">

        {/* Back */}
        <Link
          href="/admin/academias"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Todas las academias
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4">
          {academy.logo_url && (
            <img
              src={academy.logo_url}
              alt={academy.name}
              className="w-14 h-14 rounded-xl object-contain border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shrink-0"
            />
          )}
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {academy.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
              /a/{academy.slug}
            </p>
          </div>
          <span
            className="ml-auto inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0"
            style={{
              backgroundColor: `${academy.color_primary}20`,
              color: academy.color_primary,
              border: `1px solid ${academy.color_primary}40`,
            }}
          >
            {academy.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/admin/academias/${id}/vocabulario`}
            className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-700 group-hover:text-blue-400 transition-colors mt-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <h2 className="font-black text-slate-800 dark:text-slate-100 mb-1">Vocabulario</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
              {academy.uses_custom_vocabulary ? 'Vocabulario propio en BD' : 'Usando vocabulario global'}
            </p>
          </Link>

          <Link
            href={`/admin/academias/${id}/editar`}
            className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-500/5 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-700 group-hover:text-slate-500 transition-colors mt-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <h2 className="font-black text-slate-800 dark:text-slate-100 mb-1">Editar Academia</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
              Nombre, slug, logo, colores, branding
            </p>
          </Link>
        </div>

      </div>
    </main>
  );
}
