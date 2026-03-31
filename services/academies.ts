import { createClient } from '@/lib/supabase/server';
import { Academy } from '@/types/academy';

/**
 * Obtiene una academia por su slug, siempre que esté activa.
 */
export async function getAcademyBySlug(slug: string): Promise<Academy | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Academy;
}

/**
 * Lista todas las academias activas (útil para sitemaps o listados admin).
 */
export async function getActiveAcademies(): Promise<Academy[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academies')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    return [];
  }

  return data as Academy[];
}

/**
 * Obtiene todas las academias (incluyendo inactivas) para el panel admin.
 */
export async function getAllAcademies(): Promise<Academy[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academies')
    .select('*')
    .order('name');

  if (error) {
    return [];
  }

  return data as Academy[];
}

/**
 * Obtiene una academia específica por su ID.
 */
export async function getAcademyById(id: string): Promise<Academy | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academies')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Academy;
}
