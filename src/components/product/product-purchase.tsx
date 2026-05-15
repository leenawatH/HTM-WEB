"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Star, Minus, Plus, ShoppingCart, Zap, Palette } from "lucide-react";
import { toast } from "sonner";
import type { ProductDetail } from "@/lib/data";
import type { Locale } from "@/lib/constants";
import { formatPrice, discountedPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const FAMILY_LABELS: Record<string, string> = {
  neutral: "โทนขาว–เทา",
  warm: "โทนอุ่น",
  earth: "โทนเอิร์ธ",
  green: "โทนเขียว",
  blue: "โทนฟ้า–น้ำเงิน",
  purple: "โทนม่วง–ชมพู",
};
const FAMILY_ORDER = ["neutral", "warm", "earth", "green", "blue", "purple"];

export function ProductPurchase({ product }: { product: ProductDetail }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  const name = locale === "en" ? product.nameEn : product.nameTh;
  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const color = product.colors.find((c) => c.id === colorId);

  const hasDiscount = product.discountPercent > 0;
  const unitPrice = variant
    ? discountedPrice(variant.price, product.discountPercent)
    : 0;
  const inStock = (variant?.stock ?? 0) > 0;

  const colorGroups = useMemo(() => {
    const groups = new Map<string, typeof product.colors>();
    for (const c of product.colors) {
      if (!groups.has(c.family)) groups.set(c.family, []);
      groups.get(c.family)!.push(c);
    }
    return FAMILY_ORDER.filter((f) => groups.has(f)).map((f) => ({
      family: f,
      colors: groups.get(f)!,
    }));
  }, [product.colors]);

  function buildCartItem() {
    if (!variant) return null;
    return {
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name,
      brandName: product.brandName,
      variantLabel: variant.label,
      imageUrl: product.images[0]?.url ?? "/products/placeholder.svg",
      unitPrice,
      maxStock: variant.stock,
      ...(color
        ? {
            colorId: color.id,
            colorCode: color.code,
            colorName: locale === "en" ? color.nameEn : color.nameTh,
            colorHex: color.hex,
          }
        : {}),
    };
  }

  function addToCart() {
    const item = buildCartItem();
    if (!item) return;
    addItem(item, qty);
    toast.success(`เพิ่ม "${name}" ลงตะกร้าแล้ว`);
  }

  function buyNow() {
    const item = buildCartItem();
    if (!item) return;
    addItem(item, qty);
    router.push("/cart");
  }

  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">
        {product.brandName}
      </p>
      <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        {name}
      </h1>

      {/* rating */}
      <div className="mt-2 flex items-center gap-3 text-sm">
        {product.ratingCount > 0 ? (
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{product.ratingAvg.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({product.ratingCount} รีวิว)
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">ยังไม่มีรีวิว</span>
        )}
        <span className="text-muted-foreground">
          ขายแล้ว {product.salesCount} ชิ้น
        </span>
      </div>

      {/* price */}
      <div className="mt-4 flex items-end gap-3">
        <span
          className={cn(
            "font-heading text-3xl font-semibold",
            hasDiscount ? "text-sale" : "text-foreground",
          )}
        >
          {formatPrice(unitPrice)}
        </span>
        {hasDiscount && variant && (
          <>
            <span className="mb-1 text-lg text-muted-foreground line-through">
              {formatPrice(variant.price)}
            </span>
            <span className="mb-1.5 rounded-full bg-sale px-2 py-0.5 text-xs font-semibold text-white">
              -{product.discountPercent}%
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">ราคารวม VAT 7% แล้ว</p>

      {/* size / volume */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">
          {product.isPaint ? "ขนาดบรรจุ" : "ตัวเลือก"}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVariantId(v.id);
                setQty(1);
              }}
              disabled={v.stock <= 0}
              className={cn(
                "rounded-md border px-3 py-2 text-sm transition-colors",
                v.id === variantId
                  ? "border-brand bg-brand/10 font-medium text-brand"
                  : "border-border hover:border-brand/50",
                v.stock <= 0 && "cursor-not-allowed opacity-40",
              )}
            >
              {v.label}
              {v.stock <= 0 && " (หมด)"}
            </button>
          ))}
        </div>
      </div>

      {/* colour picker — paint only */}
      {product.isPaint && product.colors.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">
            เลือกสี
            {color && (
              <span className="ml-2 font-normal text-muted-foreground">
                {locale === "en" ? color.nameEn : color.nameTh} · {color.code}
              </span>
            )}
          </p>
          <div className="max-h-56 space-y-3 overflow-y-auto rounded-lg border border-border p-3">
            {colorGroups.map((g) => (
              <div key={g.family}>
                <p className="mb-1.5 text-xs text-muted-foreground">
                  {FAMILY_LABELS[g.family] ?? g.family}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {g.colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorId(c.id)}
                      title={`${locale === "en" ? c.nameEn : c.nameTh} (${c.code})`}
                      aria-label={c.nameTh}
                      className={cn(
                        "size-8 rounded-md border transition-transform hover:scale-110",
                        c.id === colorId
                          ? "ring-2 ring-brand ring-offset-1"
                          : "border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* quantity */}
      <div className="mt-6 flex items-center gap-4">
        <p className="text-sm font-medium">จำนวน</p>
        <div className="flex items-center rounded-md border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="grid size-9 place-items-center disabled:opacity-40"
            aria-label="ลดจำนวน"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() =>
              setQty((q) => Math.min(variant?.stock ?? 1, q + 1))
            }
            disabled={qty >= (variant?.stock ?? 1)}
            className="grid size-9 place-items-center disabled:opacity-40"
            aria-label="เพิ่มจำนวน"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span
          className={cn(
            "text-sm",
            inStock ? "text-success" : "text-destructive",
          )}
        >
          {inStock ? `มีสินค้า ${variant?.stock} ชิ้น` : "สินค้าหมด"}
        </span>
      </div>

      {/* actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={addToCart}
          disabled={!inStock}
        >
          <ShoppingCart className="size-5" />
          เพิ่มลงตะกร้า
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-brand hover:bg-brand-hover"
          onClick={buyNow}
          disabled={!inStock}
        >
          <Zap className="size-5" />
          ซื้อเลย
        </Button>
      </div>

      {/* color test — paint only */}
      {product.isPaint && (
        <Button
          render={<Link href={`/color-test/${product.slug}`} />}
          size="lg"
          className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Palette className="size-5" />
          🎨 ทดลองสีนี้บนผนังของคุณ
        </Button>
      )}
    </div>
  );
}
