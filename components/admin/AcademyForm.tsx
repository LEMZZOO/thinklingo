'use client';

import { useActionState, useState, ChangeEvent, useRef } from 'react';
import { saveAcademy } from '@/app/(private)/admin/academias/actions';
import { Academy } from '@/types/academy';
import Link from 'next/link';
import { AcademyVocabularyToggle } from '@/components/admin/AcademyVocabularyToggle';

interface AcademyFormProps {
  academy?: Academy;
}

export function AcademyForm({ academy }: AcademyFormProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      // Si estamos editando, inyectamos el ID
      if (academy?.id) {
        formData.append('id', academy.id);
      }
      return await saveAcademy(prev, formData);
    },
    { error: undefined, data: undefined }
  );

  // Priorizamos los datos del intento fallido (state.data) sobre los datos originales (academy)
  const currentData = state?.data || {
    name: academy?.name || '',
    slug: academy?.slug || '',
    logo_url: academy?.logo_url || '',
    headline: academy?.headline || '',
    tagline: academy?.tagline || '',
    color_primary: academy?.color_primary || '#3b82f6',
    color_secondary: academy?.color_secondary || '#1d4ed8',
    color_accent: academy?.color_accent || '#8b5cf6',
    is_active: academy?.is_active ?? true,
    uses_custom_vocabulary: academy?.uses_custom_vocabulary ?? false,
    image_type: academy?.image_type || 'logo',
  };

  const [imageType, setImageType] = useState<'logo' | 'photo'>(currentData.image_type as 'logo' | 'photo');
  const [logoPreview, setLogoPreview] = useState<string | null>(currentData.logo_url || null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
 
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setLogoRemoved(false);
 
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setFileError('El archivo debe ser una imagen válida (PNG, JPG, etc.).');
        e.target.value = ''; // Limpiar el input
        setLogoPreview(currentData.logo_url || null);
        return;
      }

      // Validar tamaño (2 MB = 2 * 1024 * 1024 bytes)
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setFileError('La imagen es demasiado pesada (máximo 2 MB).');
        e.target.value = ''; // Limpiar el input
        setLogoPreview(currentData.logo_url || null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

        {state?.error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl animate-in shake duration-500 space-y-2">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-sm font-black uppercase tracking-tight">Error al guardar</p>
            </div>
            <p className="text-xs font-bold text-rose-500/80 dark:text-rose-400/80 ml-7">
              {state.error}
            </p>
            <div className="mt-2 bg-rose-100/50 dark:bg-rose-900/20 p-2 rounded-lg ml-7 border border-rose-200/50">
               <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                 ⚠️ Importante: El archivo de imagen debe volver a seleccionarse.
               </p>
            </div>
          </div>
        )}

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
                key={`name-${currentData.name}`} 
                defaultValue={currentData.name}
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
                key={`slug-${currentData.slug}`}
                defaultValue={currentData.slug}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 font-mono"
                placeholder="ej-mi-academia"
              />
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    Logo o Foto de Portada
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gray-50/50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-3xl">
                     <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                       {logoPreview ? (
                         <img 
                            src={logoPreview} 
                            alt="Preview" 
                            className={`w-full h-full object-center ${imageType === 'logo' ? 'object-contain p-2' : 'object-cover'}`} 
                         />
                       ) : (
                         <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase italic">
                            {imageType === 'logo' ? 'Logo' : 'Foto'}
                         </div>
                       )}
                     </div>

                     <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                           <label className={`flex-1 min-w-[100px] cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${imageType === 'logo' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-gray-100 dark:border-slate-800 text-slate-400 opacity-60 hover:opacity-100'}`}>
                              <input 
                                type="radio" 
                                name="image_type" 
                                value="logo" 
                                checked={imageType === 'logo'} 
                                onChange={() => setImageType('logo')} 
                                className="hidden" 
                              />
                              <span className="text-[10px] font-black uppercase tracking-widest">Es un Logo</span>
                           </label>
                           <label className={`flex-1 min-w-[100px] cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${imageType === 'photo' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-gray-100 dark:border-slate-800 text-slate-400 opacity-60 hover:opacity-100'}`}>
                              <input 
                                type="radio" 
                                name="image_type" 
                                value="photo" 
                                checked={imageType === 'photo'} 
                                onChange={() => setImageType('photo')} 
                                className="hidden" 
                              />
                              <span className="text-[10px] font-black uppercase tracking-widest">Es una Foto</span>
                           </label>
                        </div>
                        <div className="flex flex-col gap-2">
                          <input
                            id="logo_file"
                            name="logo_file"
                            type="file"
                            accept="image/*"
                            ref={logoFileRef}
                            onChange={handleLogoChange}
                            className={`w-full text-[10px] text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-950 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer p-1 border border-dashed rounded-xl transition-colors ${fileError ? 'border-rose-500 bg-rose-50/10' : 'border-gray-200 dark:border-slate-800'}`}
                          />
                          {logoPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(null);
                                setLogoRemoved(true);
                                if (logoFileRef.current) {
                                  logoFileRef.current.value = '';
                                }
                              }}
                              className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 self-start px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                            >
                              Quitar logo
                            </button>
                          )}
                        </div>
                     </div>
                  </div>
                  <input type="hidden" name="remove_logo" value={logoRemoved ? 'true' : 'false'} />
                 {fileError && (
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-tight px-1 animate-in slide-in-from-top-1">
                      ⚠️ {fileError}
                    </p>
                 )}
               </div>

               <div className="space-y-2">
                  <label 
                    htmlFor="logo_url" 
                    className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
                  >
                    O usar URL directa
                  </label>
                  <input
                    id="logo_url"
                    name="logo_url"
                    type="text"
                    key={logoRemoved ? 'removed' : `logo_url-${currentData.logo_url}`}
                    defaultValue={logoRemoved ? '' : currentData.logo_url}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter px-1">Prioridad: Archivo seleccionado &gt; URL manual.</p>
                </div>
              </div>

            {/* Configuración */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-2 p-1">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={currentData.is_active}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Academia Activa
                </label>
              </div>
              <AcademyVocabularyToggle initialValue={currentData.uses_custom_vocabulary ?? false} />
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
                      defaultValue={currentData.color_primary} 
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                   />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Primario</span>
                </div>
                <div className="flex items-center gap-3">
                   <input 
                      type="color" 
                      name="color_secondary" 
                      defaultValue={currentData.color_secondary} 
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                   />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Secundario</span>
                </div>
                <div className="flex items-center gap-3">
                   <input 
                      type="color" 
                      name="color_accent" 
                      defaultValue={currentData.color_accent} 
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                   />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Acento</span>
                </div>
              </div>
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
                key={`headline-${currentData.headline}`}
                defaultValue={currentData.headline}
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
                key={`tagline-${currentData.tagline}`}
                defaultValue={currentData.tagline}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100"
                placeholder="La mejor academia para desarrolladores"
              />
            </div>
          </div>
        </div>
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
          disabled={isPending || !!fileError}
          className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] ${ (isPending || !!fileError) ? 'opacity-50 cursor-not-allowed' : '' }`}
        >
          {isPending ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')} Academia
        </button>
      </div>
    </form>
  );
}
