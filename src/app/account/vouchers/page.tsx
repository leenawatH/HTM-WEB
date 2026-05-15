import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { auth } from "@/auth";
import { getUserVouchers } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "คูปองส่วนลด" };

const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" });

function voucherValue(type: string, value: number) {
  if (type === "PERCENT") return `ลด ${value}%`;
  if (type === "FIXED") return `ลด ${formatPrice(value)}`;
  return "ส่งฟรี";
}

export default async function VouchersPage() {
  const session = await auth();
  if (!session?.user) return null;
  const vouchers = await getUserVouchers(session.user.id);

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold">คูปองส่วนลด</h2>

      {vouchers.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
          <Ticket className="size-12 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            ยังไม่มีคูปอง — สั่งซื้อและสมัครสมาชิกเพื่อรับคูปองส่วนลด
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vouchers.map((v) => {
            const expired = new Date(v.expiresAt) < new Date();
            const inactive = v.isUsed || expired;
            return (
              <div
                key={v.id}
                className={`flex overflow-hidden rounded-lg border border-border bg-card ${
                  inactive ? "opacity-60" : ""
                }`}
              >
                <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-brand/10 text-center text-brand">
                  <Ticket className="size-6" />
                  <span className="mt-1 px-1 text-xs font-semibold">
                    {voucherValue(v.type, v.value)}
                  </span>
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold">
                      {v.code}
                    </span>
                    {v.isUsed && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        ใช้แล้ว
                      </span>
                    )}
                    {!v.isUsed && expired && (
                      <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                        หมดอายุ
                      </span>
                    )}
                  </div>
                  {v.descriptionTh && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {v.descriptionTh}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {v.minSpend > 0 &&
                      `ขั้นต่ำ ${formatPrice(v.minSpend)} · `}
                    หมดอายุ {dateFmt.format(new Date(v.expiresAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
