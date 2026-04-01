import { createClient } from '@/lib/supabase/server';
import { getUserMemberships } from '@/services/memberships';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Mis Academias | Academy Core',
  description: 'Elige tu academia para comenzar a estudiar',
};

export default async function MisAcademiasPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const memberships = await getUserMemberships(user.id);
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
  const displayName = profile?.full_name?.trim() || user.email;

  const roleLabels: Record<string, string> = {
    student: 'Alumno',
    teacher: 'Profesor',
    academy_admin: 'Admin academia',
  };

  const primaryBg = { backgroundColor: 'var(--academy-primary, #2563EB)' };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl pt-10 pb-16 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight">
          Thinklingo<span className="text-blue-600 dark:text-blue-400">Academy</span>
        </h1>
        
        {/* Usamos form action limpio para hacer signout con Supabase si lo hay o simplemente link a logout si tuviéramos endpoint */}
        <div className="flex items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
           Hola, {displayName}
        </div>
      </div>

      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Tus Academias</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Escoge la academia a la que quieres acceder
          </p>
        </div>

        {memberships.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 text-center shadow-lg shadow-black/5">
             <div className="w-16 h-16 mx-auto bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
             </div>
             <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Aún no tienes acceso</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm">
                No figuras en ninguna academia. Por favor, pide a tu profesor o a tu academia que te envíen la invitación usando de correo <strong className="text-slate-700 dark:text-slate-300">{user.email}</strong>.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {memberships.map((m) => {
              if (!m.academies) return null;
              const aca = m.academies;
              
              return (
                <Link
                  key={m.id}
                  href={`/a/${aca.slug}/vocabulario`}
                  className="group flex items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 shrink-0 mr-5"
                    style={{ backgroundColor: aca.color_primary || '#2563EB' }}
                  >
                     {aca.logo_url ? (
                        <img src={aca.logo_url} alt={aca.name} className="w-8 h-8 object-contain" />
                     ) : (
                        <span className="text-white font-black text-xl uppercase italic">{aca.name.slice(0, 2)}</span>
                     )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-500 transition-colors">
                      {aca.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {roleLabels[m.role] || m.role}
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        • Acceder
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
