import { ForgotPasswordForm } from './ForgotPasswordForm';

export default async function ForgotPasswordPage() {
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
                    <ForgotPasswordForm />
                </section>

                <footer className="text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Recupera el acceso a tu cuenta
                    </p>
                </footer>
            </div>
        </main>
    );
}
