import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAcademyBySlug } from '@/services/academies';
import { getActiveAcademyVocabulary, getAcademyVocabularySource, toVocabularyEntry } from '@/services/academyVocabulary';
import { Suspense } from 'react';
import { getAllVocabulary } from '@/lib/vocabulary';
import AcademyVocabDetailClient from './AcademyVocabDetailClient';

export const metadata: Metadata = {
  title: 'Detalle de Vocabulario | Academy Core',
  description: 'Detalle de la palabra y gestión de progreso',
};

export default async function AcademyVocabDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  const source = getAcademyVocabularySource(academy);
  const entries = source === 'db' 
    ? (await getActiveAcademyVocabulary(academy.id)).map(toVocabularyEntry)
    : getAllVocabulary();

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <AcademyVocabDetailClient academy={academy} entry={entry} />
    </Suspense>
  );
}
