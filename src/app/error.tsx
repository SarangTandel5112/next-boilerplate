'use client';

import { useEffect } from 'react';
import { Button } from '@/modules/common';
import { logger } from '@/shared/lib/monitoring';

export default function RootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Root error boundary triggered', props.error, {
      digest: props.error.digest,
    });
  }, [props.error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 text-neutral-100">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-neutral-300">
          We could not complete this request. The issue has been logged.
        </p>
        {props.error.digest
          ? <p className="mt-3 text-xs text-neutral-400">{`Request ID: ${props.error.digest}`}</p>
          : null}
        <div className="mt-5">
          <Button onClick={props.reset}>Try again</Button>
        </div>
      </div>
    </div>
  );
}
