import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { getOrderByNumber } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { ReorderButton } from "@/components/account/reorder-button";

export const metadata: Metadata = { title: "รายละเอียดคำสั่งซื้อ" };

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeStyle: "short",
});

const PAYMENT_LABEL: Record<string, string> = {
  CARD: "บัตรเครดิต / เดบิต",
  PROMPTPAY: "พร้อมเพย์ QR",
  BANK_TRANSFER: "โอนเงินผ่านธนาคาร",
  COD: "เก็บเงินปลายทาง",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user) return null;
  const order = await getOrderByNumber(orderNumber);

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
      >
        <ChevronLeft className="size-4" />
        กลับไปประวัติคำสั่งซื้อ
      </Link>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              {order.orderNumber}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dateFmt.format(new Date(order.createdAt))}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          ชำระโดย: {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-heading text-base font-semibold">รายการสินค้า</h3>
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
              <dt>ส่วนลด</dt>
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
              <dt className="text-muted-foreground">ค่าบริการเก็บปลายทาง</dt>
              <dd>{formatPrice(order.codFee)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-heading text-base font-semibold">
            <dt>ยอดรวม</dt>
            <dd className="text-brand">{formatPrice(order.grandTotal)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-heading text-base font-semibold">ที่อยู่จัดส่ง</h3>
        <div className="mt-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {order.recipientName} · {order.recipientPhone}
          </p>
          <p>
            {order.addressLine1}
            {order.addressLine2 ? ` ${order.addressLine2}` : ""}
          </p>
          <p>
            {[
              order.subdistrict,
              order.district,
              order.province,
              order.postalCode,
            ]
              .filter(Boolean)
              .join(" ")}
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        <ReorderButton orderNumber={order.orderNumber} />
      </div>
    </div>
  );
}
