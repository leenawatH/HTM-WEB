import { Skeleton } from "@/components/ui/skeleton";

// Instant skeleton for the product detail page — mirrors product/[slug]/page.tsx.
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      {/* breadcrumb */}
      <Skeleton className="h-4 w-64" />

      {/* main */}
      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-3 flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* purchase panel */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-40" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-md" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      {/* tabs */}
      <div className="mt-12 rounded-lg border border-border bg-card p-5">
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-24" />
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
