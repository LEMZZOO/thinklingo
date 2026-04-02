'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { getMembership } from '@/services/memberships';

export type AcademySettingsState = {
  error?: string;
  success?: boolean;
};

export async function updateAcademySettings(
  academyId: string,
  slug: string,
  prev: any,
  formData: FormData
): Promise<AcademySettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado.' };
  }

  // Verificar rol academy_admin para ESTA academia
  const membership = await getMembership(user.id, academyId);
  if (!membership || membership.role !== 'academy_admin' || !membership.is_active) {
    return { error: 'No tienes permisos para editar los ajustes de esta academia.' };
  }

  const name = formData.get('name') as string;
  const headline = formData.get('headline') as string;
  const tagline = formData.get('tagline') as string;
  const color_primary = formData.get('color_primary') as string;
  const color_secondary = formData.get('color_secondary') as string;
  const color_accent = formData.get('color_accent') as string;

  if (!name || !color_primary || !color_secondary || !color_accent) {
    return { error: 'El nombre y los colores son obligatorios.' };
  }

  const logo_file = formData.get('logo_file') as File | null;
  const remove_logo = formData.get('remove_logo') === 'true';
  let final_logo_url = formData.get('logo_url') as string;

  if (remove_logo) {
    final_logo_url = '';
  }

  // 1. Preparar Admin Client para el update (salta RLS tras verificar permisos)
  const adminSupabase = createAdminClient();

  // 2. Subida de Logo (si existe archivo)
  if (logo_file && logo_file.size > 0) {
    try {
      const fileExt = logo_file.name.split('.').pop() || 'png';
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await adminSupabase.storage
        .from('academy-logos')
        .upload(filePath, logo_file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return { error: `Error subiendo logo: ${uploadError.message}` };
      }

      const { data: { publicUrl } } = adminSupabase.storage
        .from('academy-logos')
        .getPublicUrl(filePath);
      
      final_logo_url = publicUrl;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { error: `Error inesperado en la subida: ${msg}` };
    }
  }

  const updateData = {
    name,
    logo_url: final_logo_url || null,
    headline: headline || null,
    tagline: tagline || null,
    color_primary,
    color_secondary,
    color_accent,
  };

  // 3. Update real con Admin Client para persistir cambios de verdad
  const { data: updated, error: updateError } = await adminSupabase
    .from('academies')
    .update(updateData)
    .eq('id', academyId)
    .select('id, color_primary, color_secondary, color_accent')
    .single();

  if (updateError || !updated) {
    return { error: updateError?.message || 'No se pudo actualizar la academia (fila no encontrada).' };
  }

  revalidatePath(`/a/${slug}`, 'layout');
  revalidatePath(`/a/${slug}/ajustes`);
  revalidatePath('/mis-academias');
  
  return { success: true };
}
