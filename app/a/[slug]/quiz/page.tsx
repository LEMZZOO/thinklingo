import { getAcademyBySlug } from '@/services/academies';
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

  return (
    <AcademyQuizClient academy={academy} />
  );
}
