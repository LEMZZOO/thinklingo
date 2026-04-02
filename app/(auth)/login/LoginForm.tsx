'use client';

import { useActionState, useState } from 'react';
import { login } from './actions';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string } | undefined, formData: FormData) => {
      return await login(formData);
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
          Inicia sesión para continuar con tu aprendizaje
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

        <div className="space-y-2">
          <label 
            htmlFor="password" 
            className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
          >
            Contraseña
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

        {state?.error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg">
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 text-center">
              {state.error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="pt-2 space-y-4 text-center">
        <p className="text-xs text-slate-500">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Regístrate
          </Link>
        </p>
        <Link 
          href="/forgot-password" 
          className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  );
}
