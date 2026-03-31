import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Re-verify on server just in case
  if (!user || user.app_metadata?.is_superadmin !== true) {
    redirect('/');
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-64px)] pb-16">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-full mb-4">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 dark:text-amber-400">
              Acceso Superadmin
            </span>
          </div>
          
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight">
            Thinklingo<span className="text-blue-600 dark:text-blue-400">Admin</span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            ¡Hola administrador! Estás en la base del panel principal.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-wider">Usuario</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{user.email}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold tracking-wider">Estado</span>
            <span className="text-emerald-500 font-bold text-xs">Sesión Activa</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center uppercase tracking-widest font-bold">
            Configuración de Academias (Próximamente)
          </p>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-1/4 rounded-full"></div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center uppercase tracking-[0.2em] font-black">
        Academy Core <span className="text-slate-300 dark:text-slate-800">•</span> Protección Admin Lista
      </p>
    </main>
  );
}
