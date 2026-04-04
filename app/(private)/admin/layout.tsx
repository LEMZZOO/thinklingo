import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminProfileLink } from '@/components/navigation/AdminProfileLink';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_superadmin !== true) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      {/* Shared Admin Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm shadow-black/5">
        <Link href="/admin" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
           <div className="p-1.5 bg-blue-600 rounded-lg group-hover:shadow-md transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6"/></svg>
           </div>
           <span className="text-sm font-black text-slate-800 dark:text-slate-100 italic">Thinklingo<span className="text-blue-600">Admin</span></span>
        </Link>
        
        <div className="flex items-center gap-4">
           <AdminProfileLink />
        </div>
      </header>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
