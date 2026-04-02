'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Normaliza un slug según las reglas del negocio:
 * - Trim, Lowercase
 * - Espacios a guiones
 * - Eliminar caracteres no permitidos (solo a-z, 0-9, -)
 * - Colapsar guiones múltiples y limpiar extremos
 */
function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Espacios a guiones
    .replace(/[^a-z0-9-]/g, '')     // Eliminar caracteres no permitidos
    .replace(/-+/g, '-')            // Colapsar múltiples guiones
    .replace(/^-+|-+$/g, '');       // Eliminar guiones al inicio/final
}

import { createAdminClient } from '@/lib/supabase/admin';

export type AcademyFormState = {
  error?: string;
  success?: boolean;
  data?: {
    name?: string;
    slug?: string;
    logo_url?: string;
    headline?: string;
    tagline?: string;
    color_primary?: string;
    color_secondary?: string;
    color_accent?: string;
    is_active?: boolean;
    uses_custom_vocabulary?: boolean;
  };
};

export async function saveAcademy(prev: any, formData: FormData): Promise<AcademyFormState> {
  const supabase = await createClient();
  
  // Re-verificar superadmin en el servidor por seguridad
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.is_superadmin !== true) {
    return { error: 'No tienes permisos para realizar esta acción.' };
  }

  const id = formData.get('id') as string | null;
  const name = formData.get('name') as string;
  const rawSlug = formData.get('slug') as string;
  const headline = formData.get('headline') as string;
  const tagline = formData.get('tagline') as string;
  const color_primary = formData.get('color_primary') as string;
  const color_secondary = formData.get('color_secondary') as string;
  const color_accent = formData.get('color_accent') as string;
  const is_active = formData.get('is_active') === 'on';
  // checkbox ausente en formData cuando está desmarcado → false
  const uses_custom_vocabulary = formData.get('uses_custom_vocabulary') === 'on';

  // Recopilar datos actuales para devolverlos en caso de error
  const currentData = {
    name,
    slug: rawSlug,
    logo_url: formData.get('logo_url') as string,
    headline,
    tagline,
    color_primary,
    color_secondary,
    color_accent,
    is_active,
    uses_custom_vocabulary,
  };

  // 1. Validaciones básicas
  if (!name || !rawSlug || !color_primary || !color_secondary || !color_accent) {
    return { error: 'Todos los campos obligatorios deben estar rellenos.', data: currentData };
  }

  const logo_file = formData.get('logo_file') as File | null;
  const remove_logo = formData.get('remove_logo') === 'true';
  let final_logo_url = formData.get('logo_url') as string;

  // Si el usuario pidió quitar el logo explícitamente, empezamos con null
  if (remove_logo) {
    final_logo_url = '';
  }

  // 2. Normalización de slug
  const slug = normalizeSlug(rawSlug);
  if (!slug) {
    return { error: 'El slug generado no es válido (debe contener letras o números).', data: currentData };
  }

  // 3. Subida de Logo (si existe archivo)
  if (logo_file && logo_file.size > 0) {
    try {
      const fileExt = logo_file.name.split('.').pop() || 'png';
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Usar el admin client para saltar políticas RLS (solo en servidor)
      const adminSupabase = createAdminClient();

      const { error: uploadError } = await adminSupabase.storage
        .from('academy-logos')
        .upload(filePath, logo_file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return { error: `Error subiendo logo: ${uploadError.message}`, data: currentData };
      }

      const { data: { publicUrl } } = adminSupabase.storage
        .from('academy-logos')
        .getPublicUrl(filePath);
      
      final_logo_url = publicUrl;
    } catch (e: any) {
      return { error: `Error inesperado en la subida: ${e.message}`, data: currentData };
    }
  }

  // 4. Verificación de duplicados
  const query = supabase
    .from('academies')
    .select('id')
    .eq('slug', slug);
  
  if (id) {
    query.neq('id', id);
  }

  const { data: existing } = await query.single();
  if (existing) {
    return { error: `La URL (slug) "${slug}" ya está siendo usada por otra academia.`, data: currentData };
  }

  // 5. Upsert (Create or Update) con Admin Client (salta RLS tras verificar superadmin)
  const academyData = {
    name,
    slug,
    logo_url: final_logo_url || null,
    headline: headline || null,
    tagline: tagline || null,
    color_primary,
    color_secondary,
    color_accent,
    is_active,
    uses_custom_vocabulary,
  };

  const adminSupabase = createAdminClient();

  if (id) {
    // Modo Edición
    const { error: updateError } = await adminSupabase
      .from('academies')
      .update(academyData)
      .eq('id', id);

    if (updateError) return { error: updateError.message, data: currentData };
  } else {
    // Modo Creación
    const { error: insertError } = await adminSupabase
      .from('academies')
      .insert([academyData]);

    if (insertError) return { error: insertError.message, data: currentData };
  }

  // 6. Revalidar y redireccionar
  revalidatePath('/admin/academias');
  revalidatePath(`/a/${slug}`);
  redirect('/admin/academias');
}
