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

export type AcademyFormState = {
  error?: string;
  success?: boolean;
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
  const logo_url = formData.get('logo_url') as string;
  const headline = formData.get('headline') as string;
  const tagline = formData.get('tagline') as string;
  const color_primary = formData.get('color_primary') as string;
  const color_secondary = formData.get('color_secondary') as string;
  const color_accent = formData.get('color_accent') as string;
  const is_active = formData.get('is_active') === 'on';

  // 1. Validaciones básicas
  if (!name || !rawSlug || !color_primary || !color_secondary || !color_accent) {
    return { error: 'Todos los campos obligatorios deben estar rellenos.' };
  }

  // 2. Normalización de slug
  const slug = normalizeSlug(rawSlug);
  if (!slug) {
    return { error: 'El slug generado no es válido (debe contener letras o números).' };
  }

  // 3. Verificación de duplicados
  const query = supabase
    .from('academies')
    .select('id')
    .eq('slug', slug);
  
  if (id) {
    query.neq('id', id);
  }

  const { data: existing } = await query.single();
  if (existing) {
    return { error: `La URL (slug) "${slug}" ya está siendo usada por otra academia.` };
  }

  // 4. Upsert (Create or Update)
  const academyData = {
    name,
    slug,
    logo_url: logo_url || null,
    headline: headline || null,
    tagline: tagline || null,
    color_primary,
    color_secondary,
    color_accent,
    is_active,
  };

  if (id) {
    // Modo Edición
    const { error: updateError } = await supabase
      .from('academies')
      .update(academyData)
      .eq('id', id);

    if (updateError) return { error: updateError.message };
  } else {
    // Modo Creación
    const { error: insertError } = await supabase
      .from('academies')
      .insert([academyData]);

    if (insertError) return { error: insertError.message };
  }

  // 5. Revalidar y redireccionar
  revalidatePath('/admin/academias');
  revalidatePath(`/a/${slug}`);
  redirect('/admin/academias');
}
