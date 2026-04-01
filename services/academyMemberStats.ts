import { createAdminClient } from '@/lib/supabase/admin';

export interface AcademyMemberWithStats {
  id: string;
  user_id: string;
  academy_id: string;
  role: 'student' | 'teacher' | 'academy_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  stats_favorites_count: number;
  stats_seen_count: number;
  stats_learned_count: number;
  stats_quiz_correct: number;
  stats_quiz_incorrect: number;
  stats_quiz_total: number;
}

interface RPCMember {
  id: string;
  user_id: string;
  academy_id: string;
  role: 'student' | 'teacher' | 'academy_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

/**
 * Obtiene la lista de miembros de una academia con sus estadísticas de progreso.
 * Utiliza el RPC existente para obtener datos de perfil/email y agrega estadísticas.
 */
export async function getAcademyMembersWithStats(academyId: string): Promise<AcademyMemberWithStats[]> {
  const adminClient = createAdminClient();

  // 1. Obtener miembros base desde el RPC (garantiza email y nombres correctos)
  const { data: rawMembers, error: memErr } = await adminClient.rpc('get_academy_members_admin', { 
    p_academy_id: academyId 
  });
  if (memErr) throw new Error(`Error cargando miembros: ${memErr.message}`);
  const memberships = (rawMembers || []) as RPCMember[];

  // 2. Obtener favoritos relacionados con esta academia
  const { data: favorites, error: favErr } = await adminClient
    .from('user_favorites')
    .select('user_id')
    .eq('academy_id', academyId);
  if (favErr) throw new Error(`Error cargando favoritos: ${favErr.message}`);

  // 3. Obtener progreso relacionado con esta academia
  const { data: progress, error: progErr } = await adminClient
    .from('user_progress')
    .select('user_id, source, entry_key, status')
    .eq('academy_id', academyId);
  if (progErr) throw new Error(`Error cargando progreso: ${progErr.message}`);

  // 4. Obtener estadísticas de quiz para la academia
  const { data: quizStats, error: quizErr } = await adminClient
    .from('user_academy_stats')
    .select('user_id, quiz_correct, quiz_incorrect, quiz_total')
    .eq('academy_id', academyId);
  if (quizErr) throw new Error(`Error cargando quiz stats: ${quizErr.message}`);

  // 5. Consolidar datos con tipado estricto
  return memberships.map((m: RPCMember) => {
    const userId = m.user_id;
    
    // Favoritos
    const favCount = (favorites || []).filter(f => f.user_id === userId).length;

    // Progreso con regla de unicidad (source, entry_key)
    const userProg = (progress || []).filter(p => p.user_id === userId);
    
    const seenCount = new Set(
      userProg.filter(p => p.status === 'seen').map(p => `${p.source}:${p.entry_key}`)
    ).size;
    
    const learnedCount = new Set(
      userProg.filter(p => p.status === 'learned').map(p => `${p.source}:${p.entry_key}`)
    ).size;

    // Quiz
    const userQuiz = (quizStats || []).find(q => q.user_id === userId);

    return {
      ...m,
      stats_favorites_count: favCount,
      stats_seen_count: seenCount,
      stats_learned_count: learnedCount,
      stats_quiz_correct: userQuiz?.quiz_correct || 0,
      stats_quiz_incorrect: userQuiz?.quiz_incorrect || 0,
      stats_quiz_total: userQuiz?.quiz_total || 0,
    };
  });
}
