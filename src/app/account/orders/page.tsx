import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { auth } from "@/auth";
import { getUserOrders } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { ReorderButton } from "@/components/account/reorder-button";

export const metadata: Metadata = { title: "ประวัติคำสั่งซื้อ" };

const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" });

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;
  const orders = await getUserOrders(session.user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
        <Package className="size-12 text-muted-foreground/50" />
        <p className="mt-3 font-medium">ยังไม่มีคำสั่งซื้อ</p>
        <Button
          render={<Link href="/category/all" />}
          className="mt-4 bg-brand hover:bg-brand-hover"
        >
          เริ่มช้อปปิ้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.orderNumber}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold">
                {o.orderNumber}
              </span>
              <OrderStatusBadge status={o.status} />
            </div>
            <span className="text-sm text-muted-foreground">
              {dateFmt.format(new Date(o.createdAt))}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
              {o.firstImageUrl && (
                <Image
                  src={o.firstImageUrl}
                  alt={o.firstItemName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 text-sm">
              <p className="line-clamp-1 font-medium">{o.firstItemName}</p>
              <p className="text-muted-foreground">รวม {o.itemCount} ชิ้น</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-lg font-semibold text-brand">
                {formatPrice(o.grandTotal)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
            <Button
              render={<Link href={`/account/orders/${o.orderNumber}`} />}
              variant="ghost"
              size="sm"
            >
              ดูรายละเอียด
            </Button>
            <ReorderButton orderNumber={o.orderNumber} />
          </div>
        </div>
      ))}
    </div>
  );
}
