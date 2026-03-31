'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AcademyNavProps {
  slug: string;
}

const NAV_ITEMS = [
  {
    label: 'Vocabulario',
    segment: 'vocabulario',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
    ),
  },
  {
    label: 'Flashcards',
    segment: 'flashcards',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Quiz',
    segment: 'quiz',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
      </svg>
    ),
  },
  {
    label: 'Progreso',
    segment: 'progreso',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20v-6M6 20V10M18 20V4"/>
      </svg>
    ),
  },
];

export function AcademyNav({ slug }: AcademyNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 sticky top-0 z-30"
      aria-label="Navegación de academia"
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-12">
        {NAV_ITEMS.map(({ label, segment, icon }) => {
          const href = `/a/${slug}/${segment}`;

          // Exacto o subruta — `href + '/'` evita falsos positivos
          // ej. /a/foo/vocabulario2 NO activa "vocabulario"
          const isActive =
            pathname === href ||
            pathname.startsWith(`/a/${slug}/${segment}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-[var(--academy-primary)] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
