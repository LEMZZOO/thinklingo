import { getAcademyBySlug } from '@/services/academies';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMembership } from '@/services/memberships';
import { AcademySettingsForm } from '@/components/academy/AcademySettingsForm';

export default async function AcademySettingsPage({
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

  // Solo academy_admin puede acceder
  if (!membership || membership.role !== 'academy_admin' || !membership.is_active) {
    redirect(`/a/${slug}/vocabulario`);
  }

  return (
    <main className="max-w-5xl mx-auto p-6 flex flex-col items-center py-12">
      <div className="w-full max-w-4xl space-y-10">
        <div className="flex flex-col gap-2 text-center sm:text-left animate-in fade-in slide-in-from-left-4 duration-700">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Administración Principal</span>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tight">
             Configuración de la <span className="text-blue-600 dark:text-blue-400">Academia</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
             Modifica los detalles públicos y visuales de <b>{academy.name}</b>. Estos cambios afectan a la vista de todos tus alumnos y profesores.
           </p>
        </div>

        <AcademySettingsForm academy={academy} />

        <div className="flex justify-center pt-8 border-t border-gray-100 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Academy Core Engine v2 — Módulo de Administración Local
          </p>
        </div>
      </div>
    </main>
  );
}
