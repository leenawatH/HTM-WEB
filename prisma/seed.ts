// Database seed — brands, categories, brand colour charts, 24 products,
// vouchers and demo users. Run: npm run db:seed
import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  BRAND_SEED,
  CATEGORY_SEED,
  PRODUCT_SEED,
} from "./data/catalog";

const HERE = dirname(fileURLToPath(import.meta.url));
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// brands that ship a paint colour chart (hybrid generated data)
const COLOR_BRANDS = ["toa", "captain", "jbp", "nippon", "dulux", "qqq"];

type ColorFile = {
  brandSlug: string;
  collection: {
    slug: string;
    nameTh: string;
    nameEn: string;
    description: string;
  };
  colors: {
    code: string;
    nameTh: string;
    nameEn: string;
    hex: string;
    family: string;
    sortOrder: number;
  }[];
};

async function clean() {
  // delete children before parents
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.userVoucher.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brandColor.deleteMany();
  await prisma.colorCollection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Cleaning existing data...");
  await clean();

  // --- brands ---
  console.log("Seeding brands...");
  const brandBySlug = new Map<string, string>();
  for (const b of BRAND_SEED) {
    const brand = await prisma.brand.create({
      data: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        sortOrder: b.sortOrder,
        logoUrl: `/brands/${b.slug}.svg`,
      },
    });
    brandBySlug.set(b.slug, brand.id);
  }

  // --- categories ---
  console.log("Seeding categories...");
  const categoryBySlug = new Map<string, string>();
  for (const c of CATEGORY_SEED) {
    const category = await prisma.category.create({
      data: {
        nameTh: c.nameTh,
        nameEn: c.nameEn,
        slug: c.slug,
        descriptionTh: c.descriptionTh,
        sortOrder: c.sortOrder,
        imageUrl: `/categories/${c.slug}.svg`,
      },
    });
    categoryBySlug.set(c.slug, category.id);
  }

  // --- colour collections + colours ---
  console.log("Seeding brand colour charts...");
  const collectionByBrand = new Map<string, string>();
  let colourCount = 0;
  for (const slug of COLOR_BRANDS) {
    const file: ColorFile = JSON.parse(
      readFileSync(join(HERE, "data", "colors", `${slug}.json`), "utf-8"),
    );
    const brandId = brandBySlug.get(file.brandSlug);
    if (!brandId) continue;

    const collection = await prisma.colorCollection.create({
      data: {
        brandId,
        slug: file.collection.slug,
        nameTh: file.collection.nameTh,
        nameEn: file.collection.nameEn,
        description: file.collection.description,
        colors: {
          create: file.colors.map((c) => ({
            code: c.code,
            nameTh: c.nameTh,
            nameEn: c.nameEn,
            hex: c.hex,
            family: c.family,
            sortOrder: c.sortOrder,
          })),
        },
      },
    });
    collectionByBrand.set(file.brandSlug, collection.id);
    colourCount += file.colors.length;
  }

  // --- products ---
  console.log("Seeding products...");
  for (const p of PRODUCT_SEED) {
    const brandId = brandBySlug.get(p.brandSlug);
    const categoryId = categoryBySlug.get(p.categorySlug);
    if (!brandId || !categoryId) {
      throw new Error(`Missing brand/category for product ${p.slug}`);
    }

    // paint products link to their own brand's colour collection
    const collectionId = p.isPaint
      ? collectionByBrand.get(p.brandSlug)
      : undefined;

    await prisma.product.create({
      data: {
        slug: p.slug,
        nameTh: p.nameTh,
        nameEn: p.nameEn,
        descriptionTh: p.descriptionTh,
        descriptionEn: p.descriptionEn,
        basePrice: p.basePrice,
        discountPercent: p.discountPercent,
        isPaint: p.isPaint,
        isFeatured: p.isFeatured,
        salesCount: p.salesCount,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        brandId,
        categoryId,
        images: {
          create: [
            { url: `/products/${p.slug}.svg`, alt: p.nameTh, sortOrder: 0 },
            { url: `/products/${p.slug}-2.svg`, alt: p.nameTh, sortOrder: 1 },
          ],
        },
        variants: {
          create: p.variants.map((v, i) => ({
            sku: `${p.slug}-v${i + 1}`.toUpperCase(),
            label: v.label,
            priceOverride: v.priceOverride,
            stock: v.stock,
            sortOrder: i,
          })),
        },
        specs: {
          create: p.specs.map((s, i) => ({
            labelTh: s.labelTh,
            labelEn: s.labelEn,
            value: s.value,
            sortOrder: i,
          })),
        },
        ...(collectionId
          ? { colorCollections: { connect: { id: collectionId } } }
          : {}),
      },
    });
  }

  // --- vouchers ---
  console.log("Seeding vouchers...");
  const oneYear = new Date();
  oneYear.setFullYear(oneYear.getFullYear() + 1);
  await prisma.voucher.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "PERCENT",
        value: 10,
        minSpend: 300,
        maxDiscount: 200,
        descriptionTh: "ส่วนลด 10% สำหรับลูกค้าใหม่ (ขั้นต่ำ ฿300)",
        expiresAt: oneYear,
      },
      {
        code: "FREESHIP",
        type: "FREESHIP",
        value: 0,
        minSpend: 0,
        descriptionTh: "ส่งฟรีทุกออเดอร์",
        expiresAt: oneYear,
      },
      {
        code: "SAVE50",
        type: "FIXED",
        value: 50,
        minSpend: 500,
        descriptionTh: "ลด ฿50 เมื่อซื้อครบ ฿500",
        expiresAt: oneYear,
      },
      {
        code: "PAINT15",
        type: "PERCENT",
        value: 15,
        minSpend: 1000,
        maxDiscount: 500,
        descriptionTh: "ส่วนลด 15% เมื่อซื้อครบ ฿1,000",
        expiresAt: oneYear,
      },
    ],
  });

  // --- demo users ---
  console.log("Seeding demo users...");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.create({
    data: {
      name: "ผู้ดูแลระบบ",
      email: "admin@hortongmong.co.th",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  await prisma.user.create({
    data: {
      name: "ลูกค้าทดลอง",
      email: "demo@hortongmong.co.th",
      passwordHash,
      role: "CUSTOMER",
      phone: "081-234-5678",
      emailVerified: new Date(),
    },
  });

  console.log("\nSeed complete:");
  console.log(`  ${BRAND_SEED.length} brands, ${CATEGORY_SEED.length} categories`);
  console.log(`  ${COLOR_BRANDS.length} colour charts (${colourCount} colours)`);
  console.log(`  ${PRODUCT_SEED.length} products`);
  console.log(`  4 vouchers, 2 demo users (password: demo1234)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
