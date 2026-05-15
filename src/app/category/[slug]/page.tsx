import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getCategoryBySlug,
  getCategoryListing,
  getBrands,
  SORT_OPTIONS,
  type SortOption,
} from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryFilters } from "@/components/category/category-filters";
import { SortSelect } from "@/components/category/sort-select";
import { ListingPagination } from "@/components/category/listing-pagination";
import { MobileFilters } from "@/components/category/mobile-filters";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.nameTh ?? "สินค้า" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const brandSlugs =
    str(sp.brand)?.split(",").filter(Boolean) ?? [];
  const sortRaw = str(sp.sort);
  const sort: SortOption = SORT_OPTIONS.includes(sortRaw as SortOption)
    ? (sortRaw as SortOption)
    : "popular";
  const page = Number(str(sp.page)) || 1;
  const minPrice = str(sp.minPrice) ? Number(str(sp.minPrice)) : undefined;
  const maxPrice = str(sp.maxPrice) ? Number(str(sp.maxPrice)) : undefined;

  const [listing, brands] = await Promise.all([
    getCategoryListing({
      categorySlug: slug,
      brandSlugs,
      minPrice,
      maxPrice,
      sort,
      page,
    }),
    getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">
          หน้าแรก
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{category.nameTh}</span>
      </nav>

      {/* header */}
      <div className="mt-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          {category.nameTh}
        </h1>
        {category.descriptionTh && (
          <p className="mt-1 text-sm text-muted-foreground">
            {category.descriptionTh}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 rounded-lg border border-border bg-card p-4">
            <CategoryFilters brands={brands} priceBounds={listing.priceBounds} />
          </div>
        </aside>

        {/* results */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              พบ{" "}
              <span className="font-medium text-foreground">
                {listing.total}
              </span>{" "}
              รายการ
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters
                brands={brands}
                priceBounds={listing.priceBounds}
              />
              <SortSelect />
            </div>
          </div>

          <div className="mt-5">
            <ProductGrid products={listing.products} />
          </div>

          <ListingPagination page={listing.page} pageCount={listing.pageCount} />
        </div>
      </div>
    </div>
  );
}
