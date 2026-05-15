import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "ชำระเงิน" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">
          หน้าแรก
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/cart" className="hover:text-brand">
          ตะกร้าสินค้า
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">ชำระเงิน</span>
      </nav>

      <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        ชำระเงิน
      </h1>

      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
