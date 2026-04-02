'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from './actions';

export function ResetPasswordForm() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(
        async (prev: { error?: string, success?: string } | undefined, formData: FormData) => {
            return await resetPassword(formData);
        },
        undefined
    );

    useEffect(() => {
        if (state?.success) {
            const timer = setTimeout(() => {
                router.push('/login');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state?.success, router]);

    return (
        <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight">
                    Thinklingo<span className="text-blue-600 dark:text-blue-400">Academy</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Establecer Nueva Contraseña
                </p>
                <p className="text-xs text-slate-400">
                    Escribe tu nueva contraseña a continuación.
                </p>
            </div>

            <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
                    >
                        Nueva Contraseña
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="confirmPassword"
                        className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
                    >
                        Confirmar Contraseña
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
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
                    {isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
            </form>
        </div>
    );
}
