import { getAcademyBySlug } from '@/services/academies';
import { notFound } from 'next/navigation';
import AcademyFlashcardsClient from './AcademyFlashcardsClient';

export default async function AcademyFlashcardsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  return (
    <AcademyFlashcardsClient academy={academy} />
  );
}
