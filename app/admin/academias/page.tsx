import { getAllAcademies } from '@/services/academies';
import Link from 'next/link';

export default async function AcademiasListPage() {
  const academies = await getAllAcademies();

  return (
    <main className="flex-1 flex flex-col p-6 min-h-screen">
      <header className="flex justify-between items-center mb-8 animate-in slide-in-from-top duration-500 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-slate-400 hover:text-blue-500 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Gestión de <span className="text-blue-600 dark:text-blue-400">Academias</span>
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
              Fase 2: Academias Registradas
            </p>
          </div>
        </div>

        <Link 
          href="/admin/academias/nueva"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-sm md:text-base flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span className="hidden md:inline">Nueva Academia</span>
        </Link>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {academies.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-slate-400 dark:text-slate-500 font-medium italic">
              No hay academias registradas todavía.
            </p>
            <Link 
              href="/admin/academias/nueva"
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-sm"
            >
              Crea tu primera academia aquí
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Nombre</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">URL (Slug)</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Estado</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {academies.map((academy) => (
                  <tr key={academy.id} className="group hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <Link href={`/admin/academias/${academy.id}`} className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: academy.color_primary }}
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{academy.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/academias/${academy.id}`} className="block">
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">/a/{academy.slug}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {academy.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                           Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                           Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/academias/${academy.id}/vocabulario`}
                          className="text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          Vocabulario
                        </Link>
                        <Link 
                          href={`/admin/academias/${academy.id}/editar`}
                          className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-950 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="mt-8 flex justify-center opacity-50 grayscale">
         <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
            Thinklingo Academy Core • Administración
         </p>
      </footer>
    </main>
  );
}
