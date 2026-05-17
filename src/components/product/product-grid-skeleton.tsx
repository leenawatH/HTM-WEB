import { Skeleton } from "@/components/ui/skeleton";

// Placeholder grid shown by `loading.tsx` files while product data streams in.
// Mirrors the layout of <ProductGrid> / <ProductCard> so the swap is seamless.
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
        >
          <Skeleton className="aspect-square rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-1 h-6 w-24" />
            <Skeleton className="mt-2 h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
