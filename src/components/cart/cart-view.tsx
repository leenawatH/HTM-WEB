"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Minus, Plus, Trash2, Tag, X, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { computeTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { validateVoucher } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderSummary } from "@/components/cart/order-summary";

export function CartView() {
  const items = useCartStore((s) => s.items);
  const appliedVoucher = useCartStore((s) => s.appliedVoucher);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setVoucher = useCartStore((s) => s.setVoucher);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-lg bg-secondary" />;
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const totals = computeTotals({ subtotal, voucher: appliedVoucher });

  const voucherBelowMin =
    appliedVoucher != null && subtotal < appliedVoucher.minSpend;

  function applyVoucher() {
    startTransition(async () => {
      const res = await validateVoucher(code);
      if (res.ok) {
        setVoucher(res.voucher);
        setCode("");
        toast.success(`ใช้โค้ด ${res.voucher.code} แล้ว`);
      } else {
        toast.error(res.error);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
        <ShoppingBag className="size-12 text-muted-foreground/50" />
        <p className="mt-4 font-heading text-lg font-medium">
          ตะกร้าของคุณยังว่างเปล่า
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          เลือกชมสินค้าและเพิ่มลงตะกร้าได้เลย
        </p>
        <Button
          render={<Link href="/category/all" />}
          className="mt-5 bg-brand hover:bg-brand-hover"
        >
          เลือกซื้อสินค้า
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex gap-4 rounded-lg border border-border bg-card p-3"
          >
            <Link
              href={`/product/${item.slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-md bg-secondary"
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </Link>

            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {item.brandName}
                  </p>
                  <Link
                    href={`/product/${item.slug}`}
                    className="line-clamp-2 text-sm font-medium hover:text-brand"
                  >
                    {item.name}
                  </Link>
                </div>
                <button
                  onClick={() => removeItem(item.key)}
                  aria-label="ลบสินค้า"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-secondary px-1.5 py-0.5">
                  {item.variantLabel}
                </span>
                {item.colorName && (
                  <span className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5">
                    <span
                      className="size-3 rounded-full border border-border"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    {item.colorName}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-end justify-between pt-2">
                <div className="flex items-center rounded-md border border-border">
                  <button
                    onClick={() => setQuantity(item.key, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="grid size-8 place-items-center disabled:opacity-40"
                    aria-label="ลดจำนวน"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(item.key, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="grid size-8 place-items-center disabled:opacity-40"
                    aria-label="เพิ่มจำนวน"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-heading text-base font-semibold text-foreground">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.unitPrice)} / ชิ้น
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* summary side */}
      <div className="space-y-4">
        {/* voucher */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Tag className="size-4 text-brand" />
            โค้ดส่วนลด
          </p>
          {appliedVoucher ? (
            <div className="mt-3 flex items-center justify-between rounded-md bg-success/10 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-success">
                  {appliedVoucher.code}
                </p>
                {appliedVoucher.descriptionTh && (
                  <p className="text-xs text-muted-foreground">
                    {appliedVoucher.descriptionTh}
                  </p>
                )}
                {voucherBelowMin && (
                  <p className="text-xs text-destructive">
                    ใช้ได้เมื่อซื้อครบ {formatPrice(appliedVoucher.minSpend)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setVoucher(null)}
                aria-label="ลบโค้ด"
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="เช่น WELCOME10"
                className="h-9"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={applyVoucher}
                disabled={pending || !code.trim()}
              >
                ใช้โค้ด
              </Button>
            </div>
          )}
        </div>

        <OrderSummary totals={totals} itemCount={itemCount}>
          <Button
            render={<Link href="/checkout" />}
            size="lg"
            className="w-full bg-brand hover:bg-brand-hover"
          >
            ดำเนินการชำระเงิน
            <ArrowRight className="size-4" />
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}
