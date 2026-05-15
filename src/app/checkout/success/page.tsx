import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Package, QrCode, Landmark, Banknote, CreditCard } from "lucide-react";
import { getOrderByNumber } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { STORE } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "สั่งซื้อสำเร็จ" };

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeStyle: "short",
});

const PAYMENT_INFO: Record<
  string,
  { label: string; icon: typeof QrCode; instruction: string }
> = {
  CARD: {
    label: "บัตรเครดิต / เดบิต",
    icon: CreditCard,
    instruction:
      "ระบบชำระเงินอยู่ในโหมดทดสอบ — ทีมงานจะติดต่อยืนยันการชำระเงินกับคุณ",
  },
  PROMPTPAY: {
    label: "พร้อมเพย์ QR",
    icon: QrCode,
    instruction:
      "สแกน QR พร้อมเพย์เพื่อชำระเงิน (ขณะนี้เป็นโหมดทดสอบ ยังไม่ต้องชำระจริง)",
  },
  BANK_TRANSFER: {
    label: "โอนเงินผ่านธนาคาร",
    icon: Landmark,
    instruction:
      "โอนเงินมาที่ ธ.กสิกรไทย เลขบัญชี 123-4-56789-0 ชื่อบัญชี Hor Tong Mong แล้วแจ้งสลิปทาง Line",
  },
  COD: {
    label: "เก็บเงินปลายทาง",
    icon: Banknote,
    instruction: "ชำระเงินกับพนักงานจัดส่งเมื่อได้รับสินค้า",
  },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-heading text-xl font-semibold">ไม่พบคำสั่งซื้อ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ไม่พบข้อมูลคำสั่งซื้อที่ระบุ
        </p>
        <Button
          render={<Link href="/" />}
          className="mt-5 bg-brand hover:bg-brand-hover"
        >
          กลับหน้าแรก
        </Button>
      </div>
    );
  }

  const pay = PAYMENT_INFO[order.paymentMethod] ?? PAYMENT_INFO.COD;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* header */}
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-16 text-success" />
        <h1 className="mt-3 font-heading text-2xl font-semibold">
          สั่งซื้อสำเร็จ!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ขอบคุณที่สั่งซื้อกับ {STORE.name} เราได้รับคำสั่งซื้อของคุณแล้ว
        </p>
        <div className="mt-4 rounded-lg border border-border bg-card px-6 py-3">
          <p className="text-xs text-muted-foreground">หมายเลขคำสั่งซื้อ</p>
          <p className="font-heading text-lg font-semibold text-brand">
            {order.orderNumber}
          </p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {dateFmt.format(new Date(order.createdAt))}
        </p>
      </div>

      {/* payment instruction */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <pay.icon className="size-5 text-brand" />
          <h2 className="font-heading text-base font-semibold">
            การชำระเงิน — {pay.label}
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{pay.instruction}</p>
        {order.paymentMethod === "PROMPTPAY" && (
          <div className="mt-3 grid size-40 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
            <QrCode className="size-10" />
            QR ทดสอบ
          </div>
        )}
      </div>

      {/* items */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
          <Package className="size-5 text-brand" />
          รายการสินค้า
        </h2>
        <ul className="mt-3 space-y-3">
          {order.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                {it.imageUrl && (
                  <Image
                    src={it.imageUrl}
                    alt={it.productName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{it.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {it.brandName} · {it.variantLabel}
                  {it.colorName ? ` · ${it.colorName}` : ""} × {it.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(it.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ราคาสินค้า</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-success">
              <dt>ส่วนลด{order.voucherCode ? ` (${order.voucherCode})` : ""}</dt>
              <dd>-{formatPrice(order.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ค่าจัดส่ง</dt>
            <dd>
              {order.shippingFee > 0 ? formatPrice(order.shippingFee) : "ฟรี"}
            </dd>
          </div>
          {order.codFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ค่าบริการเก็บเงินปลายทาง</dt>
              <dd>{formatPrice(order.codFee)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-heading text-base font-semibold">
            <dt>ยอดชำระทั้งสิ้น</dt>
            <dd className="text-brand">{formatPrice(order.grandTotal)}</dd>
          </div>
        </dl>
      </div>

      {/* shipping address */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold">ที่อยู่จัดส่ง</h2>
        <div className="mt-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {order.recipientName} · {order.recipientPhone}
          </p>
          <p>
            {order.addressLine1}
            {order.addressLine2 ? ` ${order.addressLine2}` : ""}
          </p>
          <p>
            {[order.subdistrict, order.district, order.province, order.postalCode]
              .filter(Boolean)
              .join(" ")}
          </p>
          {order.note && <p className="mt-1">หมายเหตุ: {order.note}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          render={<Link href="/category/all" />}
          variant="outline"
          className="flex-1"
        >
          เลือกซื้อสินค้าต่อ
        </Button>
        <Button
          render={<Link href="/" />}
          className="flex-1 bg-brand hover:bg-brand-hover"
        >
          กลับหน้าแรก
        </Button>
      </div>
    </div>
  );
}
