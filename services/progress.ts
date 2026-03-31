import { createClient } from '@/lib/supabase/server';
import { WordStatus } from '@/lib/hooks'; // Assuming WordStatus is defined there, or we can move it

export interface DBUserProgress {
  favorites: string[];
  status: Record<string, WordStatus>;
  quizStats: {
    correct: number;
    incorrect: number;
    total: number;
  };
}

/**
 * Obtiene el progreso consolidado de un alumno para una academia específica y fuente.
 * Ideal para hidratar el estado inicial en Server Components.
 */
export async function getUserAcademyProgress(
  academyId: string,
  source: 'json' | 'academy_db'
): Promise<DBUserProgress> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const emptyProgress: DBUserProgress = {
    favorites: [],
    status: {},
    quizStats: { correct: 0, incorrect: 0, total: 0 }
  };

  if (!user) return emptyProgress;

  // 1. Fetch Favorites
  const { data: favs } = await supabase
    .from('user_favorites')
    .select('entry_key')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .eq('source', source);

  // 2. Fetch Progress (Status)
  const { data: prog } = await supabase
    .from('user_progress')
    .select('entry_key, status')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .eq('source', source);

  // 3. Fetch Quiz Stats
  const { data: stats } = await supabase
    .from('user_academy_stats')
    .select('quiz_correct_count, quiz_incorrect_count, quiz_total_count')
    .eq('user_id', user.id)
    .eq('academy_id', academyId)
    .single();

  // Consolidar formato para el cliente
  const favorites = favs ? favs.map(f => f.entry_key) : [];
  
  const statusRecord: Record<string, WordStatus> = {};
  if (prog) {
    prog.forEach(p => {
      statusRecord[p.entry_key] = p.status as WordStatus;
    });
  }

  const quizStats = {
    correct: stats?.quiz_correct_count || 0,
    incorrect: stats?.quiz_incorrect_count || 0,
    total: stats?.quiz_total_count || 0,
  };

  return { favorites, status: statusRecord, quizStats };
}
