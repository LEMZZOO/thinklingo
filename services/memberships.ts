import { createClient } from '@/lib/supabase/server';
import { Academy } from '@/types/academy';

export interface MembershipRecord {
  id: string;
  user_id: string;
  academy_id: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  academies?: Academy;
}

export async function getUserMemberships(userId: string): Promise<MembershipRecord[]> {
  const supabase = await createClient();

  // El left join con academies nos devuelve la información completa de la academia
  // para pintar el dashboard
  const { data, error } = await supabase
    .from('academy_memberships')
    .select('*, academies(*)')
    .eq('user_id', userId);

  if (error || !data) {
    return [];
  }

  return data as MembershipRecord[];
}

export async function hasAccessToAcademy(userId: string, academyId: string): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('academy_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('academy_id', academyId);

  if (error) {
    return false;
  }

  return (count || 0) > 0;
}
