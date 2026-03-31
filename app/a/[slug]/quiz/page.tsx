import { getAcademyBySlug } from '@/services/academies';
import { getActiveAcademyVocabulary, getAcademyVocabularySource, toVocabularyEntry } from '@/services/academyVocabulary';
import { getAllVocabulary } from '@/lib/vocabulary';
import { notFound } from 'next/navigation';
import AcademyQuizClient from './QuizClient';

export default async function AcademyQuizPage({
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
    <AcademyQuizClient academy={academy} entries={entries} />
  );
}
