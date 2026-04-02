import { createClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from './ResetPasswordForm';
import { redirect } from 'next/navigation';

export default async function ResetPasswordPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Reset password requires an active session (usually from a recovery link)
    if (!user) {
        redirect('/login?error=Para%20restablecer%20tu%20contraseña%20debes%20llegar%20desde%20el%20enlace%20de%20recuperación');
    }

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 italic">
                        Thinklingo<span className="text-blue-600">Academy</span>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">
                        Thinklingo English Core v2
                    </p>
                </header>

                <section className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 flex justify-center">
                    <ResetPasswordForm />
                </section>

                <footer className="text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Tu seguridad es nuestra prioridad
                    </p>
                </footer>
            </div>
        </main>
    );
}
