interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 5, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="bg-secondary/30 rounded-t-3xl border-b border-border flex items-center px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="flex-1 px-2">
            <div className="h-4 bg-border/50 rounded animate-pulse w-24"></div>
          </div>
        ))}
      </div>
      <div className="divide-y divide-border border border-t-0 border-border rounded-b-3xl">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex items-center px-4 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1 px-2">
                <div
                  className="h-4 bg-secondary rounded animate-pulse"
                  style={{
                    width: `${Math.floor(Math.random() * (90 - 40 + 1) + 40)}%`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
