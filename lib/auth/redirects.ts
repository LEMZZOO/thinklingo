import { redirect } from 'next/navigation';
import { getUserMemberships } from '@/services/memberships';

export async function smartLoginRedirect(userId: string, isSuperadmin = false) {
  if (isSuperadmin) {
    redirect('/admin/academias');
  }

  const memberships = await getUserMemberships(userId);

  if (memberships.length === 1 && memberships[0].academies) {
    redirect(`/a/${memberships[0].academies.slug}/vocabulario`);
  } else {
    redirect('/mis-academias');
  }
}