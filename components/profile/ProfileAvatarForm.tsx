'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileAvatarFormProps {
  userId: string;
  initialAvatarUrl?: string | null;
  fullName?: string | null;
}

export function ProfileAvatarForm({
  userId,
  initialAvatarUrl,
  fullName,
}: ProfileAvatarFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el recorte
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten imágenes JPG, PNG o WEBP.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. Máximo 5MB.');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target?.result as string);
        setCropOffset({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCropAndUpload = async () => {
    if (!imageRef.current || !containerRef.current) return;

    try {
      setUploading(true);
      setError(null);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas.');

      const size = 400; // tamaño final del avatar
      canvas.width = size;
      canvas.height = size;

      const img = imageRef.current;
      const container = containerRef.current;
      
      // Dimensiones naturales
      const { naturalWidth, naturalHeight } = img;
      
      // Dimensiones renderizadas base (zoom = 1)
      const baseWidth = img.offsetWidth;
      const baseHeight = img.offsetHeight;
      
      // El visor de recorte (círculo) es siempre 160px en el centro del contenedor
      const cropSizeInDisplay = 160; 
      
      // El centro del contenedor es el punto de referencia para el offset
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      // La posición de la imagen RELATIVA al centro del contenedor
      // Una imagen centrada (offset 0,0) tiene su centro en centerX, centerY
      // Con offset y zoom, su centro visual está en:
      const visualImageCenterX = centerX + cropOffset.x;
      const visualImageCenterY = centerY + cropOffset.y;
      
      // El visor (crop) está en:
      const visualCropLeft = centerX - (cropSizeInDisplay / 2);
      const visualCropTop = centerY - (cropSizeInDisplay / 2);
      
      // Calculamos el origen del crop RELATIVO al origen visual de la imagen
      const visualImageLeft = visualImageCenterX - (baseWidth * zoom / 2);
      const visualImageTop = visualImageCenterY - (baseHeight * zoom / 2);
      
      // Distancia en píxeles de pantalla desde el borde de la imagen al borde del visor
      const xInDisplay = visualCropLeft - visualImageLeft;
      const yInDisplay = visualCropTop - visualImageTop;
      
      // Mapear a píxeles naturales
      const scale = naturalWidth / (baseWidth * zoom);
      
      const sX = xInDisplay * scale;
      const sY = yInDisplay * scale;
      const sW = cropSizeInDisplay * scale;
      const sH = cropSizeInDisplay * scale;

      ctx.drawImage(
        img,
        sX, sY, sW, sH,
        0, 0, size, size
      );

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) throw new Error('Error al generar el recorte.');

      const fileName = `${userId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setImageToCrop(null);
      clearFileInput();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(null);
      clearFileInput();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setIsDragging(false);

  const initials = fullName
    ? fullName.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="flex w-full max-w-sm flex-col items-center space-y-6 mx-auto">
      {!imageToCrop ? (
        <div className="relative group">
          <div className="relative w-40 h-40 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center transition-all group-hover:ring-8 group-hover:ring-blue-500/10">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <span className="text-4xl font-black text-slate-400 dark:text-slate-600 italic">{initials}</span>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 border-4 border-white dark:border-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" /><line x1="16" y1="5" x2="22" y2="5" /><line x1="19" y1="1" x2="19" y2="9" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          </button>
        </div>
      ) : (
        <div className="w-full space-y-6 animate-in zoom-in-95 duration-300">
           <div className="text-center space-y-1">
             <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 italic">Ajusta tu <span className="text-blue-600">Avatar</span></h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrastra y usa el zoom para encuadrar</p>
           </div>

           <div className="relative w-full aspect-square bg-slate-200 dark:bg-slate-950 rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-slate-800 shadow-inner group">
              <div 
                ref={containerRef}
                className="absolute inset-0 cursor-move touch-none flex items-center justify-center"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                 <img 
                   ref={imageRef}
                   src={imageToCrop} 
                   alt="Para recortar" 
                   style={{ 
                     transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${zoom})`,
                     transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                   }}
                   className="max-w-none pointer-events-none select-none"
                   onLoad={(e) => {
                      const img = e.currentTarget;
                      const ratio = img.naturalWidth / img.naturalHeight;
                      if (ratio > 1) {
                        img.style.height = '200px';
                        img.style.width = 'auto';
                      } else {
                        img.style.width = '200px';
                        img.style.height = 'auto';
                      }
                   }}
                 />
              </div>

              <div className="absolute inset-0 pointer-events-none border-[40px] md:border-[60px] border-slate-900/60 flex items-center justify-center">
                 <div className="w-40 h-40 rounded-full border-2 border-dashed border-white/50 shadow-[0_0_0_9999px_rgba(15,23,42,0.4)]" />
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/></svg>
                <input 
                  type="range" min="1" max="4" step="0.1" value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setImageToCrop(null)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                 <button 
                   onClick={handleCropAndUpload}
                   disabled={uploading}
                   className="flex-2 py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
                 >
                   {uploading ? 'Procesando...' : 'Confirmar'}
                 </button>
              </div>
           </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {error && !imageToCrop && (
        <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30 text-center">{error}</p>
      )}

      <div className="flex flex-col items-center gap-2">
        {!imageToCrop && avatarUrl && (
          <button type="button" onClick={handleRemoveAvatar} disabled={uploading} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 p-2 rounded-lg transition-all disabled:opacity-50">Quitar foto</button>
        )}
      </div>
    </div>
  );
}