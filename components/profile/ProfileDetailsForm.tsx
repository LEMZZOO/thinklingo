'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileDetailsFormProps {
  userId: string;
  initialFullName?: string | null;
}

export function ProfileDetailsForm({
  userId,
  initialFullName,
}: ProfileDetailsFormProps) {
  const [fullName, setFullName] = useState(initialFullName || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', userId);

      if (error) throw error;

      setStatus('success');
      router.refresh();
      
      // Limpiar el estado de éxito después de unos segundos
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: unknown) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Error al guardar el nombre.';
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="w-full space-y-4">
      <div className="space-y-1.5">
        <label 
          htmlFor="full_name" 
          className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1"
        >
          Nombre completo
        </label>
        <div className="relative group">
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600"
            disabled={saving}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="submit"
          disabled={saving || !fullName.trim() || fullName === initialFullName}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:shadow-none disabled:scale-100"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>

        {status === 'success' && (
          <p className="text-xs font-bold text-emerald-500 animate-in fade-in slide-in-from-left-2">
            ¡Nombre actualizado!
          </p>
        )}

        {status === 'error' && (
          <p className="text-xs font-bold text-rose-500">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
