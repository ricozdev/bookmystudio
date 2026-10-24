import React, { Suspense } from 'react';
import { StudioDetailView } from '@/components/studios/StudioDetailView';

export function generateStaticParams() {
  return [{ slug: 'the-greenpoint-cove' }];
}

interface StudioDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StudioDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const title = decodedSlug
    .replace(/-[0-9]+$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} — Studio Details — BookMyStudio`,
    description: 'Certified production soundstage and film studio on BookMyStudio.',
  };
}

export default async function StudioDetailPage({ params }: StudioDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-zinc-500 font-mono">Loading production stage...</div>}>
      <StudioDetailView slug={decodedSlug} initialStudio={null} />
    </Suspense>
  );
}
