'use server';

import { createClient } from '@/lib/supabase/server';
import type { ProgressSource } from '@/services/progress';

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
  }
}

export async function setStatusAction(args: {
  academyId: string;
  source: ProgressSource;
  entryKey: string;
  status: 'new' | 'seen' | 'learned';
}) {
  const { supabase, user } = await getCurrentUserOrThrow();

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
}

export async function updateQuizStatsAction(args: {
  academyId: string;
  isCorrect: boolean;
}) {
  const { supabase } = await getCurrentUserOrThrow();

  const { error } = await supabase.rpc('increment_quiz_stats', {
    p_academy_id: args.academyId,
    p_is_correct: args.isCorrect,
  });

  if (error) throw error;
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
}
