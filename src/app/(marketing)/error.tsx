'use client';

import { useEffect } from 'react';

export default function MarketingError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Marketing error:', props.error);
  }, [props.error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-gray-600">
        {props.error.message || 'An unexpected error occurred'}
      </p>
      <button
        type="button"
        onClick={props.reset}
        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
      >
        Try again
      </button>
    </div>
  );
}
