'use client';

import { useEffect } from 'react';
import { Button } from '@/modules/common';
import { logger } from '@/shared/lib/monitoring';

export default function AdminGroupError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Admin group error boundary triggered', props.error, {
      digest: props.error.digest,
    });
  }, [props.error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-lg rounded-xl border border-red-500/25 bg-red-500/10 p-6">
        <h2 className="text-xl font-semibold text-red-100">Admin view failed to load</h2>
        <p className="mt-2 text-sm text-red-100/80">
          The request could not be completed. Please retry.
        </p>
        <p className="mt-3 text-xs text-red-100/70">
          {`Request ID: ${props.error.digest ?? 'Unavailable'}`}
        </p>
        <div className="mt-5">
          <Button variant="outline" onClick={props.reset}>Retry</Button>
        </div>
      </div>
    </div>
  );
}
