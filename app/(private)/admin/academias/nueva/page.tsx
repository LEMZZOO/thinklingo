import { AcademyForm } from '@/components/admin/AcademyForm';
import Link from 'next/link';

export default function NuevaAcademiaPage() {
  return (
    <main className="flex-1 flex flex-col items-center p-6 min-h-screen">
      <div className="w-full max-w-2xl mb-6">
        <Link
          href="/admin/academias"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Todas las academias
        </Link>
      </div>
      <AcademyForm />
    </main>
  );
}
