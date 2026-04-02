'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AcademyUserActionsProps {
  avatarUrl?: string | null;
  fullName?: string | null;
}

export function AcademyUserActions({ avatarUrl, fullName }: AcademyUserActionsProps) {
  const pathname = usePathname();

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 px-4 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Link
          href="/mis-academias"
          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all active:scale-95"
          title="Mis Academias"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href={`/perfil?returnTo=${pathname}`}
          className="group flex items-center gap-2 p-1 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/30 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          title="Ver mi perfil"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-600">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                style={{ objectPosition: 'center 20%' }}
              />
            ) : (
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 italic uppercase tracking-tighter">
                {initials}
              </span>
            )}
          </div>
          <span className="text-[10px] pr-2 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors hidden sm:inline">
            Mi Perfil
          </span>
        </Link>
      </div>
    </div>
  );
}
