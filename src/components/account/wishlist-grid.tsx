"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { ProductCardData } from "@/lib/data";
import { toggleWishlist } from "@/actions/account";
import { ProductCard } from "@/components/product/product-card";

export function WishlistGrid({ products }: { products: ProductCardData[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(productId: string) {
    startTransition(async () => {
      await toggleWishlist(productId);
      toast.success("นำออกจากรายการโปรดแล้ว");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <div key={p.id} className="relative">
          <button
            onClick={() => remove(p.id)}
            disabled={pending}
            aria-label="นำออกจากรายการโปรด"
            className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-card/90 text-muted-foreground shadow-sm hover:text-destructive"
          >
            <X className="size-4" />
          </button>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
