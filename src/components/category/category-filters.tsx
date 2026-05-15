"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type BrandOption = { slug: string; name: string };

export function CategoryFilters({
  brands,
  priceBounds,
  onApplied,
}: {
  brands: BrandOption[];
  priceBounds: { min: number; max: number };
  onApplied?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const selectedBrands =
    sp.get("brand")?.split(",").filter(Boolean) ?? [];
  const [minP, setMinP] = useState(sp.get("minPrice") ?? "");
  const [maxP, setMaxP] = useState(sp.get("maxPrice") ?? "");

  const hasFilters =
    selectedBrands.length > 0 ||
    sp.has("minPrice") ||
    sp.has("maxPrice");

  function push(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // any filter change returns to page 1
    router.push(`${pathname}?${next.toString()}`);
    onApplied?.();
  }

  function toggleBrand(slug: string) {
    const set = new Set(selectedBrands);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    push({ brand: [...set].join(",") || null });
  }

  function applyPrice() {
    push({ minPrice: minP || null, maxPrice: maxP || null });
  }

  function clearAll() {
    setMinP("");
    setMaxP("");
    router.push(pathname);
    onApplied?.();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold">ตัวกรอง</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand hover:underline"
          >
            ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* brand */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">แบรนด์</p>
        <div className="space-y-1">
          {brands.map((b) => {
            const active = selectedBrands.includes(b.slug);
            return (
              <button
                key={b.slug}
                onClick={() => toggleBrand(b.slug)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded border",
                    active
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-input",
                  )}
                >
                  {active && <Check className="size-3" />}
                </span>
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* price */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">ช่วงราคา (฿)</p>
        <p className="mb-2 text-xs text-muted-foreground">
          {priceBounds.min.toLocaleString()} – {priceBounds.max.toLocaleString()} บาท
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={String(priceBounds.min)}
            value={minP}
            onChange={(e) => setMinP(e.target.value)}
            className="h-9"
            aria-label="ราคาต่ำสุด"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={String(priceBounds.max)}
            value={maxP}
            onChange={(e) => setMaxP(e.target.value)}
            className="h-9"
            aria-label="ราคาสูงสุด"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onClick={applyPrice}
        >
          ใช้ช่วงราคา
        </Button>
      </div>
    </div>
  );
}
