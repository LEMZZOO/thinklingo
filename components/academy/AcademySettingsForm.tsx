'use client';

import { useActionState, useState, ChangeEvent, useRef, useEffect } from 'react';
import { updateAcademySettings } from '@/app/a/[slug]/ajustes/actions';
import { Academy } from '@/types/academy';
import { useRouter } from 'next/navigation';

interface AcademySettingsFormProps {
  academy: Academy;
}

export function AcademySettingsForm({ academy }: AcademySettingsFormProps) {
  const router = useRouter();
  const [fileError, setFileError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Estados locales para los colores corporativos para evitar reseteos visuales
  const [primaryColor, setPrimaryColor] = useState(academy.color_primary);
  const [secondaryColor, setSecondaryColor] = useState(academy.color_secondary);
  const [accentColor, setAccentColor] = useState(academy.color_accent);

  const [state, formAction, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      setShowSuccess(false);
      const result = await updateAcademySettings(academy.id, academy.slug, prev, formData);
      if (result.success) {
        setShowSuccess(true);
      }
      return result;
    },
    { error: undefined, success: false }
  );

  // Refrescar el layout cuando el guardado es exitoso
  useEffect(() => {
    if (state?.success) {
      router.refresh();
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  const [logoPreview, setLogoPreview] = useState<string | null>(academy.logo_url || null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
 
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setLogoRemoved(false);
 
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError('El archivo debe ser una imagen válida.');
        e.target.value = '';
        setLogoPreview(academy.logo_url || null);
        return;
      }

      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setFileError('La imagen es demasiado pesada (máximo 2 MB).');
        e.target.value = '';
        setLogoPreview(academy.logo_url || null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form action={formAction} className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 dark:border-slate-800/50 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight uppercase">
              Branding & <span className="text-blue-600 dark:text-blue-400">Ajustes</span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
              Personaliza la identidad visual de tu academia
            </p>
          </div>
          
          {showSuccess && (
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 animate-in slide-in-from-right-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Cambios guardados</span>
            </div>
          )}
        </div>

        {state?.error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight">{state.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Nombre de la Academia
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={academy.name}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Logo de Academia
              </label>
              <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-3xl">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase italic">Logo</div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    id="logo_file"
                    name="logo_file"
                    type="file"
                    accept="image/*"
                    ref={logoFileRef}
                    onChange={handleLogoChange}
                    className="w-full text-[10px] text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-400 transition-all"
                  />
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoRemoved(true);
                        if (logoFileRef.current) logoFileRef.current.value = '';
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 self-start px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    >
                      Quitar logo
                    </button>
                  )}
                  <input type="hidden" name="remove_logo" value={logoRemoved ? 'true' : 'false'} />
                  <div className="space-y-2 mt-4">
                    <label htmlFor="logo_url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                      O usa una URL directa
                    </label>
                    <input
                      id="logo_url"
                      name="logo_url"
                      type="text"
                      key={logoRemoved ? 'removed' : `logo_url-${academy.logo_url}`}
                      defaultValue={logoRemoved ? '' : (academy.logo_url || '')}
                      placeholder="https://ejemplo.com/logo.png"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                    />
                  </div>
                </div>
              </div>
              {fileError && <p className="text-[10px] font-black text-rose-500 uppercase tracking-tight px-2">⚠️ {fileError}</p>}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Colores Corporativos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50/50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-3xl">
                <div className="flex flex-col gap-2 items-center">
                  <input 
                    type="color" 
                    name="color_primary" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-4 border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-105 active:scale-95"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primario</span>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <input 
                    type="color" 
                    name="color_secondary" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-4 border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-105 active:scale-95"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secundario</span>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <input 
                    type="color" 
                    name="color_accent" 
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-4 border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-105 active:scale-95"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acento</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="headline" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Headline (Título Principal)
              </label>
              <input
                id="headline"
                name="headline"
                type="text"
                defaultValue={academy.headline || ''}
                placeholder="Ej. Domina el Inglés Técnico"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tagline" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Tagline (Eslogan corto)
              </label>
              <textarea
                id="tagline"
                name="tagline"
                defaultValue={academy.tagline || ''}
                rows={3}
                placeholder="Ej. Vocabulario real para profesionales del sector IT."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 font-medium resize-none"
              />
            </div>

            <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-[2rem] space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Información</span>
              </div>
              <p className="text-[11px] font-bold text-blue-600/70 dark:text-blue-400/70 leading-relaxed italic">
                Como <b>Administrador</b>, puedes gestionar la identidad visual de esta academia. Los cambios se aplicarán instantáneamente a todos los miembros de <b>{academy.name}</b>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-950/50 p-6 flex items-center justify-end gap-4 border-t border-gray-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={isPending || !!fileError}
          className={`px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-3 ${ (isPending || !!fileError) ? 'opacity-50 cursor-not-allowed' : '' }`}
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Guardando...
            </>
          ) : 'Guardar Ajustes'}
        </button>
      </div>
    </form>
  );
}
