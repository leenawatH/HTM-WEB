"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { discountedPrice } from "@/lib/format";
import { computeTotals, type AppliedVoucher, type PaymentMethod } from "@/lib/pricing";

export type PlaceOrderInput = {
  email: string;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict?: string;
  district: string;
  province: string;
  postalCode: string;
  note?: string;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  items: { variantId: string; colorId?: string; quantity: number }[];
};

type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function generateOrderNumber() {
  const d = new Date();
  const ymd =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HTM-${ymd}-${rand}`;
}

const REQUIRED: (keyof PlaceOrderInput)[] = [
  "email",
  "recipientName",
  "recipientPhone",
  "addressLine1",
  "district",
  "province",
  "postalCode",
];

// Creates an order from the (client-held) cart. Prices are re-derived from
// the DB — never trusted from the client. Payment is stubbed for now.
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  for (const field of REQUIRED) {
    if (!String(input[field] ?? "").trim()) {
      return { ok: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }
  }
  if (!input.items || input.items.length === 0) {
    return { ok: false, error: "ตะกร้าสินค้าว่างเปล่า" };
  }

  const variantIds = [...new Set(input.items.map((i) => i.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          brand: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  });

  const colorIds = input.items
    .map((i) => i.colorId)
    .filter((id): id is string => Boolean(id));
  const colors = colorIds.length
    ? await prisma.brandColor.findMany({ where: { id: { in: colorIds } } })
    : [];

  let subtotal = 0;
  const orderItemData: {
    productId: string;
    variantId: string;
    colorId: string | null;
    productName: string;
    brandName: string;
    variantLabel: string;
    colorName: string | null;
    colorHex: string | null;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[] = [];

  for (const it of input.items) {
    const v = variants.find((x) => x.id === it.variantId);
    if (!v) return { ok: false, error: "พบสินค้าบางรายการไม่ถูกต้อง" };
    if (it.quantity < 1) return { ok: false, error: "จำนวนสินค้าไม่ถูกต้อง" };
    if (v.stock < it.quantity) {
      return { ok: false, error: `สินค้า "${v.product.nameTh}" มีไม่เพียงพอ` };
    }

    const rawPrice =
      v.priceOverride?.toNumber() ?? v.product.basePrice.toNumber();
    const unitPrice = discountedPrice(rawPrice, v.product.discountPercent);
    const lineTotal = round2(unitPrice * it.quantity);
    subtotal += lineTotal;

    const color = it.colorId
      ? colors.find((c) => c.id === it.colorId)
      : undefined;

    orderItemData.push({
      productId: v.productId,
      variantId: v.id,
      colorId: color?.id ?? null,
      productName: v.product.nameTh,
      brandName: v.product.brand.name,
      variantLabel: v.label,
      colorName: color?.nameTh ?? null,
      colorHex: color?.hex ?? null,
      imageUrl: v.product.images[0]?.url ?? null,
      unitPrice,
      quantity: it.quantity,
      lineTotal,
    });
  }
  subtotal = round2(subtotal);

  // re-validate voucher server-side
  let voucher: AppliedVoucher | null = null;
  if (input.voucherCode) {
    const v = await prisma.voucher.findUnique({
      where: { code: input.voucherCode.trim().toUpperCase() },
    });
    const now = new Date();
    if (
      v &&
      v.isActive &&
      v.startsAt <= now &&
      v.expiresAt >= now &&
      (v.usageLimit == null || v.usedCount < v.usageLimit)
    ) {
      voucher = {
        code: v.code,
        type: v.type,
        value: v.value.toNumber(),
        minSpend: v.minSpend.toNumber(),
        maxDiscount: v.maxDiscount?.toNumber() ?? null,
        descriptionTh: v.descriptionTh,
      };
    }
  }

  const totals = computeTotals({
    subtotal,
    voucher,
    paymentMethod: input.paymentMethod,
  });

  const orderNumber = generateOrderNumber();

  // attach the order to the signed-in user, if any (guests stay null)
  const session = await auth();
  const userId = session?.user?.id ?? null;

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        orderNumber,
        userId,
        email: input.email.trim(),
        status: "PENDING",
        paymentMethod: input.paymentMethod,
        paymentStatus: "UNPAID",
        subtotal,
        discountTotal: totals.discount,
        shippingFee: totals.shippingFee,
        codFee: totals.codFee,
        vatAmount: totals.vatAmount,
        grandTotal: totals.grandTotal,
        voucherCode: voucher?.code ?? null,
        recipientName: input.recipientName.trim(),
        recipientPhone: input.recipientPhone.trim(),
        addressLine1: input.addressLine1.trim(),
        addressLine2: input.addressLine2?.trim() || null,
        subdistrict: input.subdistrict?.trim() || null,
        district: input.district.trim(),
        province: input.province.trim(),
        postalCode: input.postalCode.trim(),
        note: input.note?.trim() || null,
        items: { create: orderItemData },
      },
    });

    for (const it of input.items) {
      await tx.productVariant.update({
        where: { id: it.variantId },
        data: { stock: { decrement: it.quantity } },
      });
      await tx.product.update({
        where: { id: variants.find((v) => v.id === it.variantId)!.productId },
        data: { salesCount: { increment: it.quantity } },
      });
    }

    if (voucher) {
      await tx.voucher.update({
        where: { code: voucher.code },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  return { ok: true, orderNumber };
}

export type ReorderLine = {
  item: {
    productId: string;
    variantId: string;
    slug: string;
    name: string;
    brandName: string;
    variantLabel: string;
    imageUrl: string;
    unitPrice: number;
    maxStock: number;
    colorId?: string;
    colorCode?: string;
    colorName?: string;
    colorHex?: string;
  };
  quantity: number;
};

// Rebuilds cart-ready lines from a past order, using current catalog prices.
export async function getReorderItems(
  orderNumber: string,
): Promise<{ ok: true; lines: ReorderLine[] } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order || order.userId !== session.user.id) {
    return { ok: false, error: "ไม่พบคำสั่งซื้อ" };
  }

  const variantIds = order.items
    .map((it) => it.variantId)
    .filter((id): id is string => Boolean(id));
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          brand: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  });
  const colorIds = order.items
    .map((it) => it.colorId)
    .filter((id): id is string => Boolean(id));
  const colors = colorIds.length
    ? await prisma.brandColor.findMany({ where: { id: { in: colorIds } } })
    : [];

  const lines: ReorderLine[] = [];
  for (const it of order.items) {
    const v = variants.find((x) => x.id === it.variantId);
    if (!v || v.stock <= 0) continue;
    const rawPrice =
      v.priceOverride?.toNumber() ?? v.product.basePrice.toNumber();
    const color = it.colorId
      ? colors.find((c) => c.id === it.colorId)
      : undefined;
    lines.push({
      quantity: Math.min(it.quantity, v.stock),
      item: {
        productId: v.productId,
        variantId: v.id,
        slug: v.product.slug,
        name: v.product.nameTh,
        brandName: v.product.brand.name,
        variantLabel: v.label,
        imageUrl: v.product.images[0]?.url ?? "/products/placeholder.svg",
        unitPrice: discountedPrice(rawPrice, v.product.discountPercent),
        maxStock: v.stock,
        ...(color
          ? {
              colorId: color.id,
              colorCode: color.code,
              colorName: color.nameTh,
              colorHex: color.hex,
            }
          : {}),
      },
    });
  }

  if (lines.length === 0) {
    return { ok: false, error: "สินค้าในคำสั่งซื้อนี้ไม่พร้อมจำหน่ายแล้ว" };
  }
  return { ok: true, lines };
}
