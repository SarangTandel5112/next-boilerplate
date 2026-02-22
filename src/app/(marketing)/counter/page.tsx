import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardSkeleton, getMessage } from '@/modules/common';
import { CounterService, CounterWidget } from '@/modules/counter';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: getMessage('Counter', 'meta_title'),
    description: getMessage('Counter', 'meta_description'),
  };
}

/**
 * Server component that fetches counter data.
 */
async function CounterData() {
  const data = await CounterService.getCounter({
    next: { revalidate: 10 },
  });

  return <CounterWidget initialCount={data.count} />;
}

/**
 * Counter page with Server Components for data fetching.
 */
export default function CounterPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <CounterData />
    </Suspense>
  );
}
