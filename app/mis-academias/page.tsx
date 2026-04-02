import { createClient } from '@/lib/supabase/server';
import { getUserMemberships } from '@/services/memberships';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';
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
  const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
  const displayName = profile?.full_name?.trim() || user.email;

  const roleLabels: Record<string, string> = {
    student: 'Alumno',
    teacher: 'Profesor',
    academy_admin: 'Admin academia',
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl pt-10 pb-16 flex flex-col sm:flex-row justify-between items-center gap-6">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight">
          Thinklingo<span className="text-blue-600 dark:text-blue-400">Academy</span>
        </h1>

        <div className="flex items-center gap-6">
          <Link
            href={{ pathname: '/perfil', query: { returnTo: '/mis-academias' } }}
            className="group flex items-center gap-3 p-1.5 pr-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all active:scale-95"
            title="Ver mi perfil"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-700 group-hover:border-blue-300 transition-colors">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 25%' }}
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-blue-500 transition-colors"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              )}
            </div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
              {displayName}
            </div>
          </Link>
          <LogoutButton />
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
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Aún no tienes acceso</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No figuras en ninguna academia. Por favor, pide a tu profesor o a tu academia que te envíen la invitación usando el correo <strong className="text-slate-700 dark:text-slate-300">{user.email}</strong>.
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
                      <img src={aca.logo_url} alt={aca.name} className="w-full h-full object-cover object-center" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
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
