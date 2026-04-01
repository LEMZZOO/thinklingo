'use server';

import { createClient } from '@/lib/supabase/server';
import type { ProgressSource } from '@/services/progress';
import { UserLearningEvent, LearningEventType } from '@/types/academy-events';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Helper para logging histórico que no rompa el flujo principal si falla.
 */
async function insertLearningEventSafe(
  supabase: SupabaseClient,
  event: Partial<UserLearningEvent> & { event_type: LearningEventType; user_id: string; academy_id: string }
) {
  try {
    const { error } = await supabase.from('user_learning_events').insert(event);
    if (error) console.error('[LearningEvents] Error:', error.message);
  } catch (err) {
    console.error('[LearningEvents] Critical failure:', err);
  }
}

async function getCurrentUserOrThrow() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthenticated');
  return { supabase, user };
}

export async function toggleFavoriteAction(args: {
  academyId: string;
  source: ProgressSource;
  entryKey: string;
}) {
  const { supabase, user } = await getCurrentUserOrThrow();

  const { data: exist, error: selectError } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('academy_id', args.academyId)
    .eq('source', args.source)
    .eq('entry_key', args.entryKey)
    .maybeSingle();

  if (selectError) throw selectError;

  if (exist) {
    const { error: deleteError } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', exist.id);
    if (deleteError) throw deleteError;

    // Registro histórico SEGURO
    await insertLearningEventSafe(supabase, {
      user_id: user.id,
      academy_id: args.academyId,
      event_type: 'favorite_removed',
      source: args.source,
      entry_key: args.entryKey
    });
  } else {
    const { error: insertError } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        academy_id: args.academyId,
        source: args.source,
        entry_key: args.entryKey,
      });
    if (insertError) throw insertError;

    // Registro histórico SEGURO
    await insertLearningEventSafe(supabase, {
      user_id: user.id,
      academy_id: args.academyId,
      event_type: 'favorite_added',
      source: args.source,
      entry_key: args.entryKey
    });
  }
}

export async function setStatusAction(args: {
  academyId: string;
  source: ProgressSource;
  entryKey: string;
  status: 'new' | 'seen' | 'learned';
}) {
  const { supabase, user } = await getCurrentUserOrThrow();

  // Obtener estado previo para el historial
  const { data: prevProgress } = await supabase
    .from('user_progress')
    .select('status')
    .match({ 
      user_id: user.id, 
      academy_id: args.academyId, 
      source: args.source, 
      entry_key: args.entryKey 
    })
    .maybeSingle();

  const statusFrom = (prevProgress?.status as string) || 'new';

  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: user.id,
      academy_id: args.academyId,
      source: args.source,
      entry_key: args.entryKey,
      status: args.status,
    },
    { onConflict: 'user_id,academy_id,source,entry_key' }
  );

  if (error) throw error;

  // Registro histórico SEGURO
  if (statusFrom !== args.status) {
    await insertLearningEventSafe(supabase, {
      user_id: user.id,
      academy_id: args.academyId,
      event_type: 'status_changed',
      source: args.source,
      entry_key: args.entryKey,
      status_from: statusFrom,
      status_to: args.status
    });
  }
}

export async function updateQuizStatsAction(args: {
  academyId: string;
  isCorrect: boolean;
}) {
  const { supabase, user } = await getCurrentUserOrThrow();

  const { error } = await supabase.rpc('increment_quiz_stats', {
    p_academy_id: args.academyId,
    p_is_correct: args.isCorrect,
  });

  if (error) throw error;

  // Registro histórico SEGURO con deltas
  await insertLearningEventSafe(supabase, {
    user_id: user.id,
    academy_id: args.academyId,
    event_type: 'quiz_answered',
    quiz_correct_delta: args.isCorrect ? 1 : 0,
    quiz_incorrect_delta: args.isCorrect ? 0 : 1,
    quiz_total_delta: 1,
    metadata: { correct: args.isCorrect }
  });
}

export async function resetAcademyDataAction(args: {
  academyId: string;
  source: ProgressSource;
  type: 'all' | 'quiz' | 'favorites' | 'status';
}) {
  const { supabase, user } = await getCurrentUserOrThrow();

  if (args.type === 'all' || args.type === 'favorites') {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('academy_id', args.academyId)
      .eq('source', args.source);
    if (error) throw error;
  }

  if (args.type === 'all' || args.type === 'status') {
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('academy_id', args.academyId)
      .eq('source', args.source);
    if (error) throw error;
  }

  if (args.type === 'all' || args.type === 'quiz') {
    const { error } = await supabase
      .from('user_academy_stats')
      .delete()
      .eq('user_id', user.id)
      .eq('academy_id', args.academyId);
    if (error) throw error;
  }

  // Registro histórico SEGURO de reset
  await insertLearningEventSafe(supabase, {
    user_id: user.id,
    academy_id: args.academyId,
    event_type: args.type === 'quiz' ? 'quiz_reset' : 'academy_reset',
    source: args.source,
    metadata: { reset_type: args.type }
  });
}
