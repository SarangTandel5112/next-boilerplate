export const LoadingSkeleton = (props: { className?: string }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${props.className ?? ''}`}
      aria-label="Loading..."
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <LoadingSkeleton className="h-20 w-full" />
    </div>
  );
};
