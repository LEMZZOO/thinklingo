import { getAcademyBySlug } from '@/services/academies';
import { getMembership } from '@/services/memberships';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getAcademyMembersWithStats } from '@/services/academyMemberStats';
import { AcademyMembersClient } from './AcademyMembersClient';

export default async function AcademyMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const membership = await getMembership(user.id, academy.id);

  if (!membership || !membership.is_active || (membership.role !== 'teacher' && membership.role !== 'academy_admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Acceso Restringido</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
          Solo los <b>profesores</b> y <b>administradores</b> de la academia pueden gestionar los miembros.
        </p>
        <a href={`/a/${slug}/vocabulario`} className="px-6 py-4 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold active:scale-[0.98] transition-all">
          Volver a la Academia
        </a>
      </div>
    );
  }

  const initialMembers = await getAcademyMembersWithStats(academy.id);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <div className="max-w-5xl mx-auto pt-10 px-6">
         <h1 className="text-3xl font-black text-slate-900 dark:text-white">Gestión de Miembros</h1>
         <p className="text-slate-500 dark:text-slate-400 mt-2">
           Administra quién tiene acceso a <b>{academy.name}</b> y sus permisos.
         </p>
      </div>

      <AcademyMembersClient 
        academyId={academy.id} 
        academySlug={slug}
        initialMembers={initialMembers} 
        actorRole={membership.role}
      />
    </main>
  );
}
