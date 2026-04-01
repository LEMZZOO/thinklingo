'use server';

import { createClient } from '@/lib/supabase/server';
import { getStudentAnalyticsSummary } from '@/services/academyAnalytics';

export async function getOwnAnalyticsSummaryAction(
  academyId: string,
  from: string,
  to: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No estás autenticado.');
  }

  return getStudentAnalyticsSummary({
    academyId,
    userId: user.id,
    from,
    to,
  });
}