import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import { getUserWishlist } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { WishlistGrid } from "@/components/account/wishlist-grid";

export const metadata: Metadata = { title: "รายการโปรด" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) return null;
  const products = await getUserWishlist(session.user.id);

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold">รายการโปรด</h2>

      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
          <Heart className="size-12 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            ยังไม่มีสินค้าในรายการโปรด
          </p>
          <Button
            render={<Link href="/category/all" />}
            className="mt-4 bg-brand hover:bg-brand-hover"
          >
            เลือกชมสินค้า
          </Button>
        </div>
      ) : (
        <WishlistGrid products={products} />
      )}
    </div>
  );
}
