"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDownUp, Check } from "lucide-react";
import type { SortOption } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "ยอดนิยม" },
  { value: "price-asc", label: "ราคา: ต่ำ → สูง" },
  { value: "price-desc", label: "ราคา: สูง → ต่ำ" },
  { value: "newest", label: "ใหม่ล่าสุด" },
  { value: "discount", label: "ส่วนลดมากสุด" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = (sp.get("sort") as SortOption) ?? "popular";
  const currentLabel =
    OPTIONS.find((o) => o.value === current)?.label ?? "ยอดนิยม";

  function setSort(value: SortOption) {
    const next = new URLSearchParams(sp.toString());
    next.set("sort", value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm">
        <ArrowDownUp className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">เรียงโดย:</span>
        <span className="font-medium">{currentLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {OPTIONS.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => setSort(o.value)}>
            <span
              className={cn(
                "flex-1",
                o.value === current && "font-medium text-brand",
              )}
            >
              {o.label}
            </span>
            {o.value === current && <Check className="size-4 text-brand" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
