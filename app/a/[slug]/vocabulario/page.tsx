import { getAcademyBySlug } from '@/services/academies';
import { notFound } from 'next/navigation';
import { AcademyVocabClient } from './AcademyVocabClient';

export default async function AcademyVocabPage({
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
    <AcademyVocabClient academy={academy} />
  );
}
