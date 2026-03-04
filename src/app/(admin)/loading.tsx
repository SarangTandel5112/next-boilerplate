export default function AdminGroupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-500 border-t-neutral-100" />
          <p className="text-sm text-neutral-200" role="status" aria-live="polite">
            Loading admin workspace
          </p>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-800" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-800" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
