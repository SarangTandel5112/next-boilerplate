'use client';

import { Button } from '@/modules/common';

export default function BrandsError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
      <h2 className="text-lg font-semibold text-red-200">Unable to load brands</h2>
      <p className="mt-2 text-sm text-red-200/80">
        The brand data is currently unavailable.
      </p>
      <p className="mt-2 text-xs text-red-200/60">
        {`Request ID: ${props.error.digest ?? 'Unavailable'}`}
      </p>
      <Button className="mt-4" variant="outline" onClick={props.reset}>Try again</Button>
    </div>
  );
}
