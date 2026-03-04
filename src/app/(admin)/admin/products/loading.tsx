export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={`products-loading-${index}`} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="aspect-[16/10] rounded-lg bg-neutral-800/70" />
            <div className="h-4 rounded bg-neutral-800/70" />
            <div className="h-3 w-2/3 rounded bg-neutral-800/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
