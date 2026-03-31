import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAcademyBySlug } from '@/services/academies';
import AcademyProgressClient from './AcademyProgressClient';

export const metadata: Metadata = {
  title: 'Progreso de Academia | Academy Core',
  description: 'Visualiza tu progreso de aprendizaje en esta academia',
};

export default async function AcademyProgressPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  return <AcademyProgressClient academy={academy} />;
}
