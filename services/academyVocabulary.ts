import { createClient } from '@/lib/supabase/server';
import { AcademyVocabularyRow, Academy } from '@/types/academy';
import { VocabularyEntry } from '@/types';

/**
 * Selector puro de fuente de datos.
 * Devuelve 'json' o 'db' según el flag de la academia.
 * No realiza ningún fetch.
 */
export function getAcademyVocabularySource(
  academy: Academy
): 'json' | 'db' {
  return academy.uses_custom_vocabulary ? 'db' : 'json';
}

/**
 * Mapeo de fila de DB → VocabularyEntry (formato que consume la UI actual).
 * Actúa como anti-corruption layer entre DB y UI.
 */
export function toVocabularyEntry(row: AcademyVocabularyRow): VocabularyEntry {
  return {
    id: row.id,
    english_word: row.english_word,
    spanish_translation: row.spanish_translation,
    example_sentence_en: row.example_sentence_en ?? '',
    example_sentence_es: row.example_sentence_es ?? '',
    category: row.category ?? 'general',
    difficulty: row.difficulty,
    tags: row.tags,
    note: row.note ?? undefined,
  };
}

/**
 * Obtiene las entradas activas de vocabulario de una academia desde DB.
 * Solo para uso server-side en contexto admin (RLS requiere superadmin).
 */
export async function getActiveAcademyVocabulary(
  academyId: string
): Promise<AcademyVocabularyRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academy_vocabulary')
    .select('*')
    .eq('academy_id', academyId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as AcademyVocabularyRow[];
}

/**
 * Obtiene todas las entradas (activas e inactivas) de una academia.
 * Para uso exclusivo en el panel admin.
 */
export async function getAllAcademyVocabulary(
  academyId: string
): Promise<AcademyVocabularyRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academy_vocabulary')
    .select('*')
    .eq('academy_id', academyId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as AcademyVocabularyRow[];
}

/**
 * Activa o desactiva una entrada de vocabulario (soft delete).
 */
export async function updateAcademyVocabularyStatus(
  id: string,
  is_active: boolean
): Promise<{ ok: boolean; error: string | undefined }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('academy_vocabulary')
    .update({ is_active })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: undefined };
}

export interface CreateAcademyVocabularyInput {
  academy_id: string;
  english_word: string;
  spanish_translation: string;
  example_sentence_en?: string;
  example_sentence_es?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'advanced';
}

/**
 * Crea una nueva entrada de vocabulario para una academia.
 * Requiere sesión de superadmin (aplicado por RLS).
 */
export async function createAcademyVocabulary(
  input: CreateAcademyVocabularyInput
): Promise<{ ok: boolean; error: string | undefined }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('academy_vocabulary')
    .insert({
      academy_id: input.academy_id,
      english_word: input.english_word.trim(),
      spanish_translation: input.spanish_translation.trim(),
      example_sentence_en: input.example_sentence_en?.trim() || null,
      example_sentence_es: input.example_sentence_es?.trim() || null,
      category: input.category?.trim() || null,
      difficulty: input.difficulty ?? 'medium',
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, error: undefined };
}
