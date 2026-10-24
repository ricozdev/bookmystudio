import React, { Suspense } from 'react';
import { LocationDetailView } from '@/components/locations/LocationDetailView';

export function generateStaticParams() {
  return [{ slug: 'greenpoint-maritime-terminal' }];
}

interface LocationDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LocationDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const title = decodedSlug
    .replace(/-[0-9]+$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} — Filming Location Details — BookMyStudio`,
    description: 'Commercial filming location and production warehouse on BookMyStudio.',
  };
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-zinc-500 font-mono">Loading filming location...</div>}>
      <LocationDetailView slug={decodedSlug} initialLocation={null} />
    </Suspense>
  );
}
