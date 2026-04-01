import { createClient } from '@/lib/supabase/server';

export type ProgressSource = 'json' | 'academy_db';

export function buildProgressIdentity(
  entry: { id: string },
  source: ProgressSource
): { source: ProgressSource; entry_key: string } {
  return {
    source,
    entry_key: entry.id, // Direct mapping from ID to ensure stability
  };
}

export interface UserAcademyCloudState {
  favorites: string[];
  status: Record<string, 'new' | 'seen' | 'learned'>;
  quizStats: {
    correct: number;
    incorrect: number;
    total: number;
  };
}

/**
 * Lee el progreso consolidado desde SQL de manera segura en el servidor.
 * Solo extrae data correspondiente al usuario de la sesión actual (auth.uid()).
 */
export async function getCloudProgress(
  academyId: string,
  source: ProgressSource
): Promise<UserAcademyCloudState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fallback: UserAcademyCloudState = {
    favorites: [],
    status: {},
    quizStats: { correct: 0, incorrect: 0, total: 0 }
  };

  if (!user) return fallback;

  // 1. Fetch Favorites
  const { data: favs } = await supabase
    .from('user_favorites')
    .select('entry_key')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .eq('source', source);

  // 2. Fetch Status
  const { data: stps } = await supabase
    .from('user_progress')
    .select('entry_key, status')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .eq('source', source);

  // 3. Fetch Quiz Stats
  const { data: stats } = await supabase
    .from('user_academy_stats')
    .select('quiz_correct, quiz_incorrect, quiz_total')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .single();

  const statusRecord: Record<string, 'new' | 'seen' | 'learned'> = {};
  if (stps) {
    stps.forEach(p => {
      statusRecord[p.entry_key] = p.status as 'new' | 'seen' | 'learned';
    });
  }

  return {
    favorites: favs ? favs.map(f => f.entry_key) : [],
    status: statusRecord,
    quizStats: {
      correct: stats?.quiz_correct || 0,
      incorrect: stats?.quiz_incorrect || 0,
      total: stats?.quiz_total || 0,
    }
  };
}
