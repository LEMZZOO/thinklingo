import { getAcademyById } from '@/services/academies';
import { notFound } from 'next/navigation';
import { AcademyForm } from '@/components/admin/AcademyForm';

export default async function EditarAcademiaPage({
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
    <main className="flex-1 flex flex-col items-center p-6 min-h-screen">
      <div className="w-full max-w-2xl mb-6">
        <a
          href={`/admin/academias/${id}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          {academy.name}
        </a>
      </div>
      <AcademyForm academy={academy} />
    </main>
  );
}
