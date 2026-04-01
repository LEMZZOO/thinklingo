import { getAcademyBySlug } from '@/services/academies';
import { notFound, redirect } from 'next/navigation';
import { AcademyNav } from '@/components/academy/AcademyNav';
import { AcademyProgressProvider } from '@/components/academy/AcademyProgressProvider';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { hasAccessToAcademy } from '@/services/memberships';
import { getCloudProgress } from '@/services/progress';
import { getAcademyVocabularySource } from '@/services/academyVocabulary';

export default async function AcademyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  // Consideramos notFound si no existe o ya viene filtrado como inactivo
  if (!academy) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const hasAccess = await hasAccessToAcademy(user.id, academy.id);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Acceso Denegado</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
          No figuras como alumno de la academia <b>{academy.name}</b>. Si crees que es un error, contacta con tu profesor.
        </p>
        <a href="/mis-academias" className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
          Volver a Mis Academias
        </a>
      </div>
    );
  }

  const rawSource = getAcademyVocabularySource(academy);
  const source = (rawSource === 'db' ? 'academy_db' : 'json') satisfies import('@/services/progress').ProgressSource;
  const initialState = await getCloudProgress(academy.id, source);

  // Estilo dinámico inyectado como variables CSS de branding
  const brandingStyles = {
    '--academy-primary': academy.color_primary,
    '--academy-secondary': academy.color_secondary,
    '--academy-accent': academy.color_accent,
    borderColor: academy.color_primary,
  } as React.CSSProperties;

  return (
    <AcademyProgressProvider
      academyId={academy.id}
      academySlug={slug}
      source={source}
      initialState={initialState}
    >
      <div style={brandingStyles} className="min-h-full border-t-4">
        <AcademyNav slug={slug} />
        {children}
      </div>
    </AcademyProgressProvider>
  );
}
