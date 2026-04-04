import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileAvatarForm } from '@/components/profile/ProfileAvatarForm';
import { ProfileDetailsForm } from '@/components/profile/ProfileDetailsForm';
import { LogoutButton } from '@/components/auth/LogoutButton';
import Link from 'next/link';

export const metadata = {
  title: 'Mi Perfil | Academy Core',
  description: 'Gestiona tu información de perfil',
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const returnTo = (typeof params.returnTo === 'string' && params.returnTo.startsWith('/'))
    ? params.returnTo
    : '/mis-academias';

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-lg mb-10 flex items-center gap-4">
        <Link 
          href={returnTo} 
          className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-slate-400 hover:text-blue-500 transition-all active:scale-95"
          title="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight">
          Tu <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30">Perfil</span>
        </h1>
      </div>

      <div className="w-full max-w-md space-y-8 px-2 sm:px-0">
        {/* Avatar Section */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-black/5 flex flex-col items-center space-y-6 transition-all hover:shadow-black/10">
          <ProfileAvatarForm 
            userId={user.id} 
            initialAvatarUrl={profile?.avatar_url}
            fullName={profile?.full_name}
          />

          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {profile?.full_name || 'Sin nombre'}
            </h2>
          </div>
        </section>

        {/* Form Section */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-8">
           <div className="flex flex-col space-y-1 pl-1">
              <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest leading-tight">Datos de Cuenta</span>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Información básica de tu perfil en Thinklingo.
              </p>
           </div>
           
           <div className="space-y-6">
              <div className="p-4 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-gray-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-inner leading-none shrink-0">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Email registrado</span>
                 </div>
                 <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 break-all sm:break-normal text-left sm:text-right">{user.email}</span>
              </div>

              <ProfileDetailsForm userId={user.id} initialFullName={profile?.full_name} />
           </div>
        </section>

        <section className="px-4">
           <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 text-center">
              <p className="text-[10px] font-black uppercase text-blue-400 dark:text-blue-600 tracking-widest mb-1">Nota</p>
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 leading-relaxed italic">
                Cualquier cambio que realices aquí se verá reflejado inmediatamente en el panel de profesor y administrador de tus academias activas.
              </p>
           </div>
        </section>

        {/* Logout Section */}
        <section className="px-4 pb-10">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col text-center sm:text-left">
                 <span className="text-xs font-black uppercase text-rose-500 tracking-widest leading-tight">Zona de sesión</span>
                 <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    Cierra tu sesión de forma segura en este dispositivo.
                 </p>
              </div>
              <LogoutButton />
           </div>
        </section>
      </div>
    </main>
  );
}
