import { redirect } from 'next/navigation';
import { getUserMemberships } from '@/services/memberships';

/**
 * Resuelve hacia dónde debe ir un usuario logeado:
 * - A su academia directa si solo tiene 1.
 * - Al lobby /mis-academias si tiene varias (o ninguna).
 */
export async function smartLoginRedirect(userId: string) {
  const memberships = await getUserMemberships(userId);

  if (memberships.length === 1 && memberships[0].academies) {
    redirect(`/a/${memberships[0].academies.slug}/vocabulario`);
  } else {
    redirect('/mis-academias');
  }
}
