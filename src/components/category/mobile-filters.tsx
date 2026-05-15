"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryFilters } from "@/components/category/category-filters";

export function MobileFilters({
  brands,
  priceBounds,
}: {
  brands: { slug: string; name: string }[];
  priceBounds: { min: number; max: number };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="sm" />}
        className="lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        ตัวกรอง
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>ตัวกรองสินค้า</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <CategoryFilters
            brands={brands}
            priceBounds={priceBounds}
            onApplied={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
