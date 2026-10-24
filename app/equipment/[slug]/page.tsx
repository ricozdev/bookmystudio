import React, { Suspense } from 'react';
import { EquipmentDetailView } from '@/components/equipment/EquipmentDetailView';

export function generateStaticParams() {
  return [{ slug: 'arri-alexa-35-production-kit' }];
}

interface EquipmentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EquipmentDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const title = decodedSlug
    .replace(/-[0-9]+$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} — Cinema Equipment Details — BookMyStudio`,
    description: 'Certified cinema camera and production grip package on BookMyStudio.',
  };
}

export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-zinc-500 font-mono">Loading equipment details...</div>}>
      <EquipmentDetailView slug={decodedSlug} initialEquipment={null} />
    </Suspense>
  );
}
