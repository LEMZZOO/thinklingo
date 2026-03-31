'use server';

import { createClient } from '@/lib/supabase/server';
import { WordStatus } from '@/lib/hooks';

/**
 * Añade o quita y devuelve el nuevo estado (añadido = true, quitado = false).
 */
export async function toggleFavoriteAction(
  academyId: string,
  source: 'json' | 'academy_db',
  entryKey: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Comprobar si existe
  const { data: exist } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .eq('source', source)
    .eq('entry_key', entryKey)
    .single();

  if (exist) {
    // Si existe, lo borramos (Toggle off)
    await supabase.from('user_favorites').delete().eq('id', exist.id);
  } else {
    // Si no existe, lo creamos (Toggle on)
    await supabase.from('user_favorites').insert({
      user_id: user.id,
      academy_id: academyId,
      source,
      entry_key: entryKey
    });
  }
}

/**
 * Upsert del estado (new | seen | learned) de una palabra.
 */
export async function setStatusAction(
  academyId: string,
  source: 'json' | 'academy_db',
  entryKey: string,
  status: WordStatus
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Supabase upsert requires primary keys or unique constraint matching.
  // Our table has a UNIQUE constraint on (user_id, academy_id, source, entry_key).
  await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        academy_id: academyId,
        source: source,
        entry_key: entryKey,
        status: status,
      },
      { onConflict: 'user_id, academy_id, source, entry_key' }
    );
}

/**
 * Sube o baja el contador global del usuario en el Quiz para esta academia.
 */
export async function updateQuizStatsAction(
  academyId: string,
  isCorrect: boolean
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Lógica: fetch actual, increment, upsert. (Una RPC en DB sería más óptima, 
  // pero para no requerir que el usuario edite funciones en Supabase, lo hacemos aquí).
  const { data: current } = await supabase
    .from('user_academy_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .single();

  const prevCorrect = current?.quiz_correct_count || 0;
  const prevIncorrect = current?.quiz_incorrect_count || 0;
  const prevTotal = current?.quiz_total_count || 0;

  await supabase
    .from('user_academy_stats')
    .upsert(
      {
        user_id: user.id,
        academy_id: academyId,
        quiz_correct_count: prevCorrect + (isCorrect ? 1 : 0),
        quiz_incorrect_count: prevIncorrect + (isCorrect ? 0 : 1),
        quiz_total_count: prevTotal + 1,
      },
      { onConflict: 'user_id, academy_id' }
    );
}

/**
 * Botón del Pánico: Resetea progreso (Favorites, Quiz, Status)
 */
export async function resetDataAction(
  academyId: string,
  type: 'all' | 'quiz' | 'favorites' | 'status'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (type === 'all' || type === 'favorites') {
    await supabase.from('user_favorites').delete()
      .eq('user_id', user.id).eq('academy_id', academyId);
  }

  if (type === 'all' || type === 'status') {
    await supabase.from('user_progress').delete()
      .eq('user_id', user.id).eq('academy_id', academyId);
  }

  if (type === 'all' || type === 'quiz') {
    await supabase.from('user_academy_stats').delete()
      .eq('user_id', user.id).eq('academy_id', academyId);
  }
}
