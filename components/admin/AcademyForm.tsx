'use client';

import { useActionState } from 'react';
import { saveAcademy } from '@/app/admin/academias/actions';
import { Academy } from '@/types/academy';
import Link from 'next/link';

interface AcademyFormProps {
  academy?: Academy;
}

export function AcademyForm({ academy }: AcademyFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      // Si estamos editando, inyectamos el ID
      if (academy?.id) {
        formData.append('id', academy.id);
      }
      return await saveAcademy(prev, formData);
    },
    { error: undefined }
  );

  const isEdit = !!academy;

  return (
    <form action={formAction} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in transition-all duration-500">
      <div className="p-8 space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight uppercase">
            {isEdit ? 'Editar' : 'Nueva'} <span className="text-blue-600 dark:text-blue-400">Academia</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
            Configuración Base y Branding
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información General */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
              >
                Nombre de la Academia
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={academy?.name}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
                placeholder="Ej. English Master"
              />
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="slug" 
                className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
              >
                Slug (URL)
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={academy?.slug}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 font-mono"
                placeholder="ej-mi-academia"
              />
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="logo_url" 
                className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
              >
                Logo URL (Texto)
              </label>
              <input
                id="logo_url"
                name="logo_url"
                type="text"
                defaultValue={academy?.logo_url || ''}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>

          {/* Branding de Colores */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label 
                className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
              >
                Colores Corporativos
              </label>
              <div className="grid grid-cols-1 gap-3 p-4 bg-gray-50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                   <input 
                      type="color" 
                      name="color_primary" 
                      defaultValue={academy?.color_primary || '#3b82f6'} 
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                   />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Primario</span>
                </div>
                <div className="flex items-center gap-3">
                   <input 
                      type="color" 
                      name="color_secondary" 
                      defaultValue={academy?.color_secondary || '#1d4ed8'} 
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                   />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Secundario</span>
                </div>
                <div className="flex items-center gap-3">
                   <input 
                      type="color" 
                      name="color_accent" 
                      defaultValue={academy?.color_accent || '#8b5cf6'} 
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                   />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Acento</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                defaultChecked={isEdit ? academy?.is_active : true}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
              />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Academia Activa
              </label>
            </div>
          </div>

          {/* Headline y Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="headline" 
                className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
              >
                Headline (Título Landing)
              </label>
              <input
                id="headline"
                name="headline"
                type="text"
                defaultValue={academy?.headline || ''}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
                placeholder="Aprende Inglés Moderno"
              />
            </div>
            <div className="space-y-2">
              <label 
                htmlFor="tagline" 
                className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
              >
                Tagline (Descripción Corta)
              </label>
              <input
                id="tagline"
                name="tagline"
                type="text"
                defaultValue={academy?.tagline || ''}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
                placeholder="La mejor academia para desarrolladores"
              />
            </div>
          </div>
        </div>

        {state?.error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl animate-in shake duration-500">
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Error: {state.error}
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-slate-950/50 p-6 flex items-center justify-between gap-4 border-t border-gray-100 dark:border-slate-800">
        <Link 
            href="/admin/academias"
            className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {isPending ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')} Academia
        </button>
      </div>
    </form>
  );
}
