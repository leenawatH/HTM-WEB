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

// ============================================================
// Category listing
// ============================================================

export const SORT_OPTIONS = [
  "popular",
  "price-asc",
  "price-desc",
  "newest",
  "discount",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

const SORT_MAP: Record<SortOption, object> = {
  popular: { salesCount: "desc" },
  "price-asc": { basePrice: "asc" },
  "price-desc": { basePrice: "desc" },
  newest: { createdAt: "desc" },
  discount: { discountPercent: "desc" },
};

export const PAGE_SIZE = 12;

export type CategoryListingResult = {
  products: ProductCardData[];
  total: number;
  pageCount: number;
  page: number;
  priceBounds: { min: number; max: number };
};

export async function getCategoryBySlug(slug: string) {
  if (slug === "all") {
    return { slug: "all", nameTh: "สินค้าทั้งหมด", nameEn: "All Products", descriptionTh: null, imageUrl: null };
  }
  const c = await prisma.category.findUnique({ where: { slug } });
  if (!c) return null;
  return {
    slug: c.slug,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    descriptionTh: c.descriptionTh,
    imageUrl: c.imageUrl,
  };
}

export async function getCategoryListing(opts: {
  categorySlug: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
}): Promise<CategoryListingResult> {
  const { categorySlug } = opts;
  const brandSlugs = opts.brandSlugs ?? [];
  const sort: SortOption = opts.sort ?? "popular";
  const page = Math.max(1, opts.page ?? 1);

  const priceFilter =
    opts.minPrice != null || opts.maxPrice != null
      ? {
          ...(opts.minPrice != null ? { gte: opts.minPrice } : {}),
          ...(opts.maxPrice != null ? { lte: opts.maxPrice } : {}),
        }
      : undefined;

  const where = {
    isActive: true,
    ...(categorySlug !== "all"
      ? { category: { slug: categorySlug } }
      : {}),
    ...(brandSlugs.length ? { brand: { slug: { in: brandSlugs } } } : {}),
    ...(priceFilter ? { basePrice: priceFilter } : {}),
  };

  // price bounds for the slider — scoped to the category, ignores filters
  const boundsWhere = {
    isActive: true,
    ...(categorySlug !== "all" ? { category: { slug: categorySlug } } : {}),
  };

  const [total, rows, bounds] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: SORT_MAP[sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: cardInclude,
    }),
    prisma.product.aggregate({
      where: boundsWhere,
      _min: { basePrice: true },
      _max: { basePrice: true },
    }),
  ]);

  return {
    products: rows.map(toCardData),
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    page,
    priceBounds: {
      min: Math.floor(bounds._min.basePrice?.toNumber() ?? 0),
      max: Math.ceil(bounds._max.basePrice?.toNumber() ?? 5000),
    },
  };
}

// ============================================================
// Product detail
// ============================================================

export type ProductColor = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  hex: string;
  family: string;
};

export type ProductDetail = {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  descriptionEn: string | null;
  isPaint: boolean;
  brandName: string;
  brandSlug: string;
  categorySlug: string;
  categoryNameTh: string;
  categoryNameEn: string;
  basePrice: number;
  discountPercent: number;
  ratingAvg: number;
  ratingCount: number;
  salesCount: number;
  images: { url: string; alt: string | null }[];
  variants: { id: string; label: string; price: number; stock: number }[];
  specs: { labelTh: string; labelEn: string; value: string }[];
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    body: string;
    createdAt: string;
    authorName: string;
  }[];
  colors: ProductColor[];
};

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { slug: true, nameTh: true, nameEn: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      colorCollections: {
        include: { colors: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!p || !p.isActive) return null;

  const basePrice = p.basePrice.toNumber();
  return {
    id: p.id,
    slug: p.slug,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    descriptionTh: p.descriptionTh,
    descriptionEn: p.descriptionEn,
    isPaint: p.isPaint,
    brandName: p.brand.name,
    brandSlug: p.brand.slug,
    categorySlug: p.category.slug,
    categoryNameTh: p.category.nameTh,
    categoryNameEn: p.category.nameEn,
    basePrice,
    discountPercent: p.discountPercent,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    salesCount: p.salesCount,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      price: v.priceOverride?.toNumber() ?? basePrice,
      stock: v.stock,
    })),
    specs: p.specs.map((s) => ({
      labelTh: s.labelTh,
      labelEn: s.labelEn,
      value: s.value,
    })),
    reviews: p.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      authorName: r.user.name ?? "ลูกค้า",
    })),
    colors: p.colorCollections.flatMap((cc) =>
      cc.colors.map((c) => ({
        id: c.id,
        code: c.code,
        nameTh: c.nameTh,
        nameEn: c.nameEn,
        hex: c.hex,
        family: c.family,
      })),
    ),
  };
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4,
): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { slug: categorySlug },
      id: { not: excludeId },
    },
    orderBy: { salesCount: "desc" },
    take: limit,
    include: cardInclude,
  });
  return rows.map(toCardData);
}

export async function getAllProductSlugs() {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

// ============================================================
// Orders
// ============================================================

export type OrderView = {
  orderNumber: string;
  userId: string | null;
  email: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  codFee: number;
  vatAmount: number;
  grandTotal: number;
  voucherCode: string | null;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  subdistrict: string | null;
  district: string;
  province: string;
  postalCode: string;
  note: string | null;
  createdAt: string;
  items: {
    productName: string;
    brandName: string;
    variantLabel: string;
    colorName: string | null;
    colorHex: string | null;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};

export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderView | null> {
  const o = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!o) return null;
  return {
    orderNumber: o.orderNumber,
    userId: o.userId,
    email: o.email,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    subtotal: o.subtotal.toNumber(),
    discountTotal: o.discountTotal.toNumber(),
    shippingFee: o.shippingFee.toNumber(),
    codFee: o.codFee.toNumber(),
    vatAmount: o.vatAmount.toNumber(),
    grandTotal: o.grandTotal.toNumber(),
    voucherCode: o.voucherCode,
    recipientName: o.recipientName,
    recipientPhone: o.recipientPhone,
    addressLine1: o.addressLine1,
    addressLine2: o.addressLine2,
    subdistrict: o.subdistrict,
    district: o.district,
    province: o.province,
    postalCode: o.postalCode,
    note: o.note,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((it) => ({
      productName: it.productName,
      brandName: it.brandName,
      variantLabel: it.variantLabel,
      colorName: it.colorName,
      colorHex: it.colorHex,
      imageUrl: it.imageUrl,
      unitPrice: it.unitPrice.toNumber(),
      quantity: it.quantity,
      lineTotal: it.lineTotal.toNumber(),
    })),
  };
}

// ============================================================
// Account — all functions are scoped to a userId
// ============================================================

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { orders: true } } },
  });
  if (!user) return null;
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    loyaltyTier: user.loyaltyTier,
    birthDate: user.birthDate ? user.birthDate.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    orderCount: user._count.orders,
  };
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    grandTotal: o.grandTotal.toNumber(),
    createdAt: o.createdAt.toISOString(),
    itemCount: o.items.reduce((n, it) => n + it.quantity, 0),
    firstItemName: o.items[0]?.productName ?? "",
    firstImageUrl: o.items[0]?.imageUrl ?? null,
    reorderItems: o.items
      .filter((it) => it.variantId)
      .map((it) => ({
        variantId: it.variantId as string,
        colorId: it.colorId,
        quantity: it.quantity,
      })),
  }));
}

export async function getUserAddresses(userId: string) {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    label: a.label,
    recipient: a.recipient,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    subdistrict: a.subdistrict,
    district: a.district,
    province: a.province,
    postalCode: a.postalCode,
    isDefault: a.isDefault,
  }));
}

export async function getUserVouchers(userId: string) {
  const rows = await prisma.userVoucher.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { voucher: true },
  });
  return rows.map((uv) => ({
    id: uv.id,
    source: uv.source,
    isUsed: uv.isUsed,
    code: uv.voucher.code,
    type: uv.voucher.type,
    value: uv.voucher.value.toNumber(),
    minSpend: uv.voucher.minSpend.toNumber(),
    descriptionTh: uv.voucher.descriptionTh,
    expiresAt: (uv.expiresAt ?? uv.voucher.expiresAt).toISOString(),
  }));
}

export async function getUserWishlist(
  userId: string,
): Promise<ProductCardData[]> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: cardInclude } },
  });
  return rows
    .filter((w) => w.product.isActive)
    .map((w) => toCardData(w.product));
}

export async function isInWishlist(userId: string, productId: string) {
  const row = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return Boolean(row);
}
