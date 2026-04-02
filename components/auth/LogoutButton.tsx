'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback redirect
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95 shadow-sm"
    >
      Cerrar sesión
    </button>
  );
}
