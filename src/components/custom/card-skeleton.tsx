export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-skeleton-${i}`}
          className="glass-card p-5 rounded-3xl space-y-4 border border-border animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-secondary"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-secondary rounded"></div>
                <div className="h-3 w-16 bg-secondary/50 rounded"></div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-secondary"></div>
          </div>
          <div className="pt-2 space-y-2">
            <div className="h-6 w-1/3 bg-secondary rounded"></div>
            <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-secondary w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
