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
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Selecciona una imagen.');
      }

      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten imágenes JPG, PNG o WEBP.');
      }

      if (file.size > 3 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. El máximo permitido es 3MB.');
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      clearFileInput();
      router.refresh();
    } catch (err: unknown) {
      let message = 'Error al subir la imagen.';

      if (err instanceof Error) {
        if (
          err.message.includes('bucket_not_found') ||
          err.message.toLowerCase().includes('bucket not found')
        ) {
          message =
            'El almacenamiento de avatares no está configurado todavía. Falta el bucket "avatars" en Supabase Storage.';
        } else {
          message = err.message;
        }
      }

      setError(message);
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

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(null);
      clearFileInput();
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al quitar la foto.';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const initials = fullName
    ? fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : '?';

  return (
    <div className="flex w-full max-w-sm flex-col items-center space-y-4 mx-auto">
      <div className="relative group">
        <div className="relative w-40 h-40 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center transition-all group-hover:ring-8 group-hover:ring-blue-500/10">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName ? `Avatar de ${fullName}` : 'Avatar'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: 'center top',
                transform: 'scale(1.45) translateY(-14px)',
                transformOrigin: 'center top',
              }}
            />
          ) : (
            <span className="text-4xl font-black text-slate-400 dark:text-slate-600 italic">
              {initials}
            </span>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 border-4 border-white dark:border-slate-900"
          title="Cambiar foto de perfil"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <line x1="16" y1="5" x2="22" y2="5" />
            <line x1="19" y1="1" x2="19" y2="9" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30 text-center">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
          Haz clic en el icono para cambiar la foto
        </p>

        {avatarUrl && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all disabled:opacity-50"
          >
            Quitar foto
          </button>
        )}
      </div>
    </div>
  );
}