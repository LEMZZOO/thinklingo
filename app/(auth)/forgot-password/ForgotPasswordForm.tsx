'use client';

import { useActionState, useState } from 'react';
import { forgotPassword } from './actions';
import Link from 'next/link';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [state, formAction, isPending] = useActionState(
        async (prev: { error?: string, success?: string } | undefined, formData: FormData) => {
            return await forgotPassword(formData);
        },
        undefined
    );

    return (
        <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight">
                    Thinklingo<span className="text-blue-600 dark:text-blue-400">Academy</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Restablecer Contraseña
                </p>
                <p className="text-xs text-slate-400">
                    Introduce tu email y te enviaremos un enlace de recuperación.
                </p>
            </div>

            <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
                    >
                        Correo Electrónico
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>

                {state?.error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg">
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400 text-center">
                            {state.error}
                        </p>
                    </div>
                )}

                {state?.success && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-lg">
                        <p className="text-xs font-bold text-green-600 dark:text-green-400 text-center">
                            {state.success}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending || !!state?.success}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                    {isPending ? 'Enviando email...' : 'Enviar Enlace'}
                </button>
            </form>

            <div className="pt-2 text-center">
                <Link href="/login" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Volver a Iniciar Sesión
                </Link>
            </div>
        </div>
    );
}
