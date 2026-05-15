import "server-only";
import { prisma } from "@/lib/prisma";

// Serialised, client-safe product shape (Prisma Decimal -> number).
export type ProductCardData = {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  isPaint: boolean;
  brandName: string;
  brandSlug: string;
  categorySlug: string;
  imageUrl: string;
  basePrice: number;
  discountPercent: number;
  ratingAvg: number;
  ratingCount: number;
  variantCount: number;
  firstVariant: { id: string; label: string; price: number; stock: number } | null;
};

const PLACEHOLDER_IMG = "/products/placeholder.svg";

type ProductWithRelations = {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  isPaint: boolean;
  basePrice: { toNumber(): number };
  discountPercent: number;
  ratingAvg: number;
  ratingCount: number;
  brand: { name: string; slug: string };
  category: { slug: string };
  images: { url: string }[];
  variants: {
    id: string;
    label: string;
    priceOverride: { toNumber(): number } | null;
    stock: number;
  }[];
};

function toCardData(p: ProductWithRelations): ProductCardData {
  const first = p.variants[0];
  const basePrice = p.basePrice.toNumber();
  return {
    id: p.id,
    slug: p.slug,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    isPaint: p.isPaint,
    brandName: p.brand.name,
    brandSlug: p.brand.slug,
    categorySlug: p.category.slug,
    imageUrl: p.images[0]?.url ?? PLACEHOLDER_IMG,
    basePrice,
    discountPercent: p.discountPercent,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    variantCount: p.variants.length,
    firstVariant: first
      ? {
          id: first.id,
          label: first.label,
          price: first.priceOverride?.toNumber() ?? basePrice,
          stock: first.stock,
        }
      : null,
  };
}

const cardInclude = {
  brand: { select: { name: true, slug: true } },
  category: { select: { slug: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
  variants: { orderBy: { sortOrder: "asc" } },
} as const;

// "Recommended" — popular + discounted products for the home page.
export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ isFeatured: true }, { discountPercent: { gt: 0 } }],
    },
    orderBy: [{ salesCount: "desc" }],
    take: limit,
    include: cardInclude,
  });
  return products.map(toCardData);
}

export async function getCategoriesWithCount() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    imageUrl: c.imageUrl,
    productCount: c._count.products,
  }));
}

export async function getBrands() {
  const brands = await prisma.brand.findMany({ orderBy: { sortOrder: "asc" } });
  return brands.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    logoUrl: b.logoUrl,
  }));
}
