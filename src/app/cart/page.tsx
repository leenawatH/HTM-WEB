import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "ตะกร้าสินค้า" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">
          หน้าแรก
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">ตะกร้าสินค้า</span>
      </nav>

      <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        ตะกร้าสินค้า
      </h1>

      <div className="mt-6">
        <CartView />
      </div>
    </div>
  );
}
