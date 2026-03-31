import { getAcademyById } from '@/services/academies';
import { notFound } from 'next/navigation';
import { AcademyForm } from '@/components/admin/AcademyForm';

export default async function EditarAcademiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const academy = await getAcademyById(id);

  if (!academy) {
    notFound();
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">
      <AcademyForm academy={academy} />
    </main>
  );
}
