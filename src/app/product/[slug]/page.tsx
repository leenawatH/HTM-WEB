import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/home/section-heading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "ไม่พบสินค้า" };
  return {
    title: product.nameTh,
    description: product.descriptionTh ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">
          หน้าแรก
        </Link>
        <ChevronRight className="size-4" />
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-brand"
        >
          {product.categoryNameTh}
        </Link>
        <ChevronRight className="size-4" />
        <span className="line-clamp-1 text-foreground">{product.nameTh}</span>
      </nav>

      {/* main */}
      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.nameTh} />
        <ProductPurchase product={product} />
      </div>

      {/* tabs */}
      <div className="mt-12 rounded-lg border border-border bg-card p-5">
        <ProductTabs product={product} />
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            title="สินค้าที่เกี่ยวข้อง"
            viewAllHref={`/category/${product.categorySlug}`}
          />
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
