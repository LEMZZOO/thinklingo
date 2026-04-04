import { getAcademyBySlug } from '@/services/academies';
import { getActiveAcademyVocabulary, getAcademyVocabularySource, toVocabularyEntry } from '@/services/academyVocabulary';
import { getAllVocabulary } from '@/lib/vocabulary';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AcademyVocabClient } from '../vocabulario/AcademyVocabClient';

export default async function AcademyFavoritesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  const source = getAcademyVocabularySource(academy);
  const entries = source === 'db' 
    ? (await getActiveAcademyVocabulary(academy.id)).map(toVocabularyEntry)
    : getAllVocabulary();

  return (
    <Suspense fallback={null}>
      <AcademyVocabClient academy={academy} entries={entries} favoritesOnly={true} />
    </Suspense>
  );
}
