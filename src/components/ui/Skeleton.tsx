type SkeletonProps = {
  count?: number;
};

export default function Skeleton({ count = 8 }: SkeletonProps) {
  return (
    <div
      aria-label="Loading products"
      aria-live="polite"
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          className="flex animate-pulse flex-col gap-3 rounded-[10px] border border-line bg-white p-4"
          key={index}
        >
          <div className="aspect-[4/3] w-full rounded-[6px] bg-surface" />
          <div className="h-3.5 rounded bg-surface" />
          <div className="h-3.5 w-2/3 rounded bg-surface" />
          <div className="h-[18px] w-2/5 rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}
