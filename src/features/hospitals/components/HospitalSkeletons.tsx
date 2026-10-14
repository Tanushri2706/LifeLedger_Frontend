"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function HospitalCardSkeleton() {
  return (
    <div className="surface-calm flex h-full flex-col justify-between rounded-xl border border-border/60 p-5 sm:p-6 space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>
    </div>
  );
}

export function HospitalGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <HospitalCardSkeleton key={i} />
      ))}
    </div>
  );
}
