import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  // ColorTestStudio renders as a full-screen camera overlay.
  return (
    <ColorTestStudio
      product={{ name: product.nameTh, slug: product.slug }}
      colors={product.colors}
    />
  );
}
