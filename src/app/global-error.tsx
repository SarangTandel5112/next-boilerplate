'use client';
import { useEffect } from 'react';
import { logger } from '@/shared/lib/monitoring';

export default function GlobalError(props: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    logger.error('Global error boundary triggered', props.error, {
      digest: props.error.digest,
    });
  }, [props.error]);

  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">
        <main className="flex min-h-screen items-center justify-center px-6">
          <section className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
            <h1 className="text-2xl font-semibold">Unexpected application error</h1>
            <p className="mt-2 text-sm text-neutral-300">
              A critical error occurred. Please reload the page.
            </p>
            {props.error.digest
              ? <p className="mt-3 text-xs text-neutral-400">{`Request ID: ${props.error.digest}`}</p>
              : null}
          </section>
        </main>
      </body>
    </html>
  );
}
