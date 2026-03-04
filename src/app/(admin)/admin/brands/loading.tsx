export default function BrandsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={`brands-loading-${index}`} className="h-14 animate-pulse rounded-lg bg-neutral-800/70" />
        ))}
      </div>
    </div>
  );
}
