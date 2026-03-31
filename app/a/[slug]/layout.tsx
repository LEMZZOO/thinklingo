import { getAcademyBySlug } from '@/services/academies';
import { notFound } from 'next/navigation';
import React from 'react';

export default async function AcademyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  // Consideramos notFound si no existe o ya viene filtrado como inactivo
  if (!academy) {
    notFound();
  }

  // Estilo dinámico inyectado como variables CSS de branding
  const brandingStyles = {
    '--academy-primary': academy.color_primary,
    '--academy-secondary': academy.color_secondary,
    '--academy-accent': academy.color_accent,
  } as React.CSSProperties;

  return (
    <div style={brandingStyles} className="min-h-full border-t-4 border-(--academy-primary)">
      {children}
    </div>
  );
}
