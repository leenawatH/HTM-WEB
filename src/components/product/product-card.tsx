"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Star, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { ProductCardData } from "@/lib/data";
import type { Locale } from "@/lib/constants";
import { formatPrice, discountedPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: ProductCardData }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const addItem = useCartStore((s) => s.addItem);

  const name = locale === "en" ? product.nameEn : product.nameTh;
  const hasDiscount = product.discountPercent > 0;
  const finalPrice = discountedPrice(product.basePrice, product.discountPercent);

  // paint / multi-variant products need an options choice on the detail page
  const needsChoice = product.isPaint || product.variantCount > 1;

  function quickAdd() {
    const v = product.firstVariant;
    if (!v) return;
    addItem({
      productId: product.id,
      variantId: v.id,
      slug: product.slug,
      name,
      brandName: product.brandName,
      variantLabel: v.label,
      imageUrl: product.imageUrl,
      unitPrice: discountedPrice(v.price, product.discountPercent),
      maxStock: v.stock,
    });
    toast.success(`เพิ่ม "${name}" ลงตะกร้าแล้ว`);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        <Image
          src={product.imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-sale px-2 py-0.5 text-xs font-semibold text-white">
            -{product.discountPercent}%
          </span>
        )}
        {product.isPaint && (
          <span className="absolute right-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
            🎨 ทดลองสีได้
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.brandName}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-foreground hover:text-brand"
        >
          {name}
        </Link>

        {product.ratingCount > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">
              {product.ratingAvg.toFixed(1)}
            </span>
            <span>({product.ratingCount})</span>
          </div>
        )}

        <div className="mt-2 flex items-end gap-2">
          <span
            className={cn(
              "font-heading text-lg font-semibold",
              hasDiscount ? "text-sale" : "text-foreground",
            )}
          >
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="mb-0.5 text-sm text-muted-foreground line-through">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>
        {product.variantCount > 1 && (
          <p className="text-xs text-muted-foreground">เริ่มต้น</p>
        )}

        <div className="mt-3">
          {needsChoice ? (
            <Button
              render={<Link href={`/product/${product.slug}`} />}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <SlidersHorizontal className="size-4" />
              เลือกตัวเลือก
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full bg-brand hover:bg-brand-hover"
              onClick={quickAdd}
              disabled={!product.firstVariant || product.firstVariant.stock <= 0}
            >
              <ShoppingCart className="size-4" />
              {t("addToCart")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
