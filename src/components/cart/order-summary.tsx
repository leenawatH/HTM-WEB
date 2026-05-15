import type { ReactNode } from "react";
import type { OrderTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

export function OrderSummary({
  totals,
  itemCount,
  children,
}: {
  totals: OrderTotals;
  itemCount: number;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-heading text-lg font-semibold">สรุปคำสั่งซื้อ</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label={`ราคาสินค้า (${itemCount} ชิ้น)`}>
          {formatPrice(totals.subtotal)}
        </Row>

        {totals.discount > 0 && (
          <Row label="ส่วนลด" accent="text-success">
            -{formatPrice(totals.discount)}
          </Row>
        )}

        <Row label="ค่าจัดส่ง">
          {totals.shippingFee > 0 ? (
            formatPrice(totals.shippingFee)
          ) : (
            <span className="font-medium text-success">ฟรี</span>
          )}
        </Row>

        {totals.codFee > 0 && (
          <Row label="ค่าบริการเก็บเงินปลายทาง">
            {formatPrice(totals.codFee)}
          </Row>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-heading text-base font-semibold">
              ยอดชำระทั้งสิ้น
            </span>
            <span className="font-heading text-xl font-semibold text-brand">
              {formatPrice(totals.grandTotal)}
            </span>
          </div>
          <p className="mt-0.5 text-right text-xs text-muted-foreground">
            (รวม VAT 7% — {formatPrice(totals.vatAmount)})
          </p>
        </div>
      </dl>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

function Row({
  label,
  children,
  accent,
}: {
  label: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ?? "text-foreground"}>{children}</dd>
    </div>
  );
}
