import { createClient } from '@/lib/supabase/server';
import { RegisterForm } from './RegisterForm';

export default async function RegisterPage() {
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

                <section className="bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 dark:border-slate-800 flex justify-center">
                    <RegisterForm />
                </section>

                <footer className="text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Regístrate para recibir acceso a tu academia
                    </p>
                </footer>
            </div>
        </main>
    );
}
