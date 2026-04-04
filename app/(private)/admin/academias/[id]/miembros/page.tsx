import { getAcademyById } from '@/services/academies';
import { getAcademyMembers } from './actions';
import { MembersClient } from './MembersClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const academy = await getAcademyById(id);
  
  if (!academy) notFound();

  const members = await getAcademyMembers(id);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <Link href={`/admin/academias/${id}`} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver a {academy.name}
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Miembros de {academy.name}</h1>
        </div>
        
        <MembersClient academyId={id} initialMembers={members || []} />
      </div>
    </main>
  );
}
