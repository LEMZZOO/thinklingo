import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white italic">
            Thinklingo<span className="text-blue-600">Academy</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">
            Thinklingo English Core v2
          </p>
        </header>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 dark:border-slate-800 space-y-6">
          {user && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-800 leading-tight">Sesión activa detectable</p>
                <p className="text-[10px] font-medium text-amber-600 leading-normal">
                  Ya has iniciado sesión como <span className="font-bold underline">{user.email}</span>. Si entras con otra cuenta, la sesión actual será reemplazada.
                </p>
              </div>
            </div>
          )}
          <LoginForm />
        </section>

        <footer className="text-center">
          <p className="text-xs text-slate-400 font-medium">
            Solo para estudiantes registrados
          </p>
        </footer>
      </div>
    </main>
  );
}