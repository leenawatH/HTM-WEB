import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Instant skeleton for the category listing — mirrors category/[slug]/page.tsx.
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      {/* breadcrumb */}
      <Skeleton className="h-4 w-40" />

      {/* header */}
      <Skeleton className="mt-4 h-8 w-56" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="h-5 w-24" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </aside>

        {/* results */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="mt-5">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
