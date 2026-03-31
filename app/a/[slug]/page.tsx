import { getAcademyBySlug } from '@/services/academies';
import { notFound, redirect } from 'next/navigation';

export default async function AcademyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  // Gateway directo hacia la zona protegida una vez que layout.tsx ha validado la auth y membresía
  redirect(`/a/${slug}/vocabulario`);
}
