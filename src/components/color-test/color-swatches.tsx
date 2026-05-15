"use client";

import type { ProductColor } from "@/lib/data";
import { cn } from "@/lib/utils";

const FAMILY_LABELS: Record<string, string> = {
  neutral: "ขาว–เทา",
  warm: "โทนอุ่น",
  earth: "เอิร์ธ",
  green: "เขียว",
  blue: "ฟ้า–น้ำเงิน",
  purple: "ม่วง–ชมพู",
};
const FAMILY_ORDER = ["neutral", "warm", "earth", "green", "blue", "purple"];

export function ColorSwatches({
  colors,
  selectedId,
  onSelect,
}: {
  colors: ProductColor[];
  selectedId: string;
  onSelect: (c: ProductColor) => void;
}) {
  const groups = FAMILY_ORDER.map((family) => ({
    family,
    colors: colors.filter((c) => c.family === family),
  })).filter((g) => g.colors.length > 0);

  return (
    <div className="max-h-44 space-y-2.5 overflow-y-auto pr-1">
      {groups.map((g) => (
        <div key={g.family}>
          <p className="mb-1 text-xs text-muted-foreground">
            {FAMILY_LABELS[g.family] ?? g.family}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {g.colors.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                title={`${c.nameTh} (${c.code})`}
                aria-label={c.nameTh}
                className={cn(
                  "size-8 rounded-md border transition-transform hover:scale-110",
                  c.id === selectedId
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
  );
}
