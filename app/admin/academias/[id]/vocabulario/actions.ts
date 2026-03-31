'use server';

import { revalidatePath } from 'next/cache';
import { createAcademyVocabulary, updateAcademyVocabularyStatus } from '@/services/academyVocabulary';

export async function addVocabEntry(
  academyId: string,
  formData: FormData
): Promise<{ ok: boolean; error: string | undefined }> {
  const english_word = (formData.get('english_word') as string)?.trim();
  const spanish_translation = (formData.get('spanish_translation') as string)?.trim();

  if (!english_word || !spanish_translation) {
    return { ok: false, error: 'La palabra en inglés y la traducción son obligatorias.' };
  }

  const result = await createAcademyVocabulary({
    academy_id: academyId,
    english_word,
    spanish_translation,
    example_sentence_en: (formData.get('example_sentence_en') as string) || undefined,
    example_sentence_es: (formData.get('example_sentence_es') as string) || undefined,
    category: (formData.get('category') as string) || undefined,
    difficulty: (formData.get('difficulty') as 'easy' | 'medium' | 'advanced') || 'medium',
  });

  if (result.ok) {
    revalidatePath(`/admin/academias/${academyId}/vocabulario`);
  }

  return result;
}

export async function toggleVocabularyStatus(
  formData: FormData
): Promise<void> {
  const id = formData.get('id') as string;
  const academyId = formData.get('academyId') as string;

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academy_vocabulary')
    .select('is_active')
    .eq('id', id)
    .single();

  if (error || !data) return;

  await updateAcademyVocabularyStatus(id, !data.is_active);
  revalidatePath(`/admin/academias/${academyId}/vocabulario`);
}

export async function updateAcademyVocabularyWord(
  formData: FormData
): Promise<void> {
  const id = formData.get('id') as string;
  const academyId = formData.get('academyId') as string;
  const english_word = (formData.get('english_word') as string)?.trim();
  const spanish_translation = (formData.get('spanish_translation') as string)?.trim();

  if (!english_word || !spanish_translation) {
    throw new Error('Ambos campos son obligatorios.');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { error } = await supabase
    .from('academy_vocabulary')
    .update({ english_word, spanish_translation })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/academias/${academyId}/vocabulario`);
}

export async function moveVocabularyItem(
  formData: FormData
): Promise<void> {
  const id = formData.get('id') as string;
  const academyId = formData.get('academyId') as string;
  const direction = formData.get('direction') as 'up' | 'down';

  if (!id || !academyId || !direction) return;

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // 1. Obtener todos los items ordenador por order_index
  const { data: vocab, error: fetchError } = await supabase
    .from('academy_vocabulary')
    .select('id, order_index')
    .eq('academy_id', academyId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true }); // Fallback

  if (fetchError || !vocab || vocab.length === 0) throw new Error('Error al cargar vocabulario');

  // 2. Normalizar indices a secuenciales (0...N-1) localmente para evitar problemas de colisión
  const updates = vocab.map((v, i) => ({ id: v.id, order_index: i }));

  const currentIndex = updates.findIndex(u => u.id === id);
  if (currentIndex === -1) throw new Error('Item no encontrado');

  let targetIndex = -1;
  if (direction === 'up' && currentIndex > 0) {
    targetIndex = currentIndex - 1;
  } else if (direction === 'down' && currentIndex < updates.length - 1) {
    targetIndex = currentIndex + 1;
  }

  if (targetIndex !== -1) {
    // Intercambiar order_index
    const temp = updates[currentIndex].order_index;
    updates[currentIndex].order_index = updates[targetIndex].order_index;
    updates[targetIndex].order_index = temp;

    // Solo actualizar los que han cambiado
    const promises = [];
    for (let i = 0; i < updates.length; i++) {
      if (updates[i].order_index !== vocab[i].order_index) {
        promises.push(
          supabase
            .from('academy_vocabulary')
            .update({ order_index: updates[i].order_index })
            .eq('id', updates[i].id)
        );
      }
    }

    await Promise.all(promises);
  }

  revalidatePath(`/admin/academias/${academyId}/vocabulario`);
}
