export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-stone-200 dark:bg-stone-800 ${className}`}
    />
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
      <Skeleton className="w-14 h-20 flex-shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function SessionGridSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
            <Skeleton className="w-14 h-20 flex-shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SessionDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex gap-6 mb-8">
        <Skeleton className="w-24 h-36 flex-shrink-0 rounded-xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="space-y-8">
        <section>
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        </section>

        <section>
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
