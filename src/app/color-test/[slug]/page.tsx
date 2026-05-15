import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/data";
import { ColorTestStudio } from "@/components/color-test/color-test-studio";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `ทดลองสี — ${product.nameTh}` : "ทดลองสี" };
}

export default async function ColorTestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isPaint || product.colors.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <Link
        href={`/product/${product.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
      >
        <ChevronLeft className="size-4" />
        กลับไปหน้าสินค้า
      </Link>

      <div className="mt-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          🎨 ทดลองสีบนผนังจริง
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.brandName} · {product.nameTh} — เปิดกล้องหรืออัปโหลดรูป
          แล้วแตะที่ผนังเพื่อดูสีจริงก่อนตัดสินใจ
        </p>
      </div>

      <div className="mt-6">
        <ColorTestStudio
          product={{ name: product.nameTh, slug: product.slug }}
          colors={product.colors}
        />
      </div>
    </div>
  );
}
