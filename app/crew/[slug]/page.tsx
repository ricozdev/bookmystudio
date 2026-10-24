import React, { Suspense } from 'react';
import { CrewDetailView } from '@/components/crew/CrewDetailView';

export function generateStaticParams() {
  return [{ slug: 'marcus-vance' }];
}

interface CrewDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CrewDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const title = decodedSlug
    .replace(/-[0-9]+$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} — Production Crew Profile — BookMyStudio`,
    description: 'Certified production head of department on BookMyStudio.',
  };
}

export default async function CrewDetailPage({ params }: CrewDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-zinc-500 font-mono">Loading crew profile...</div>}>
      <CrewDetailView slug={decodedSlug} initialMember={null} />
    </Suspense>
  );
}
