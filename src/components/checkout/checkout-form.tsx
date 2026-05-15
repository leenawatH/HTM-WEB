"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  CreditCard,
  QrCode,
  Landmark,
  Banknote,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { computeTotals, type PaymentMethod } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderSummary } from "@/components/cart/order-summary";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof CreditCard;
}[] = [
  { value: "CARD", label: "บัตรเครดิต / เดบิต", desc: "ชำระผ่าน Stripe", icon: CreditCard },
  { value: "PROMPTPAY", label: "พร้อมเพย์ QR", desc: "สแกนจ่ายผ่านแอปธนาคาร", icon: QrCode },
  { value: "BANK_TRANSFER", label: "โอนเงินผ่านธนาคาร", desc: "แนบสลิปหลังโอน", icon: Landmark },
  { value: "COD", label: "เก็บเงินปลายทาง", desc: "มีค่าบริการเพิ่ม ฿20", icon: Banknote },
];

const EMPTY_FORM = {
  email: "",
  recipientName: "",
  recipientPhone: "",
  addressLine1: "",
  addressLine2: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
  note: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const appliedVoucher = useCartStore((s) => s.appliedVoucher);
  const clear = useCartStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [form, setForm] = useState(EMPTY_FORM);
  const [payment, setPayment] = useState<PaymentMethod>("PROMPTPAY");
  const [placing, startTransition] = useTransition();
  const [placed, setPlaced] = useState(false);

  if (!mounted) {
    return <div className="h-96 animate-pulse rounded-lg bg-secondary" />;
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-20 text-center">
        <ShoppingBag className="size-12 text-muted-foreground/50" />
        <p className="mt-4 font-heading text-lg font-medium">
          ยังไม่มีสินค้าให้ชำระเงิน
        </p>
        <Button
          render={<Link href="/category/all" />}
          className="mt-5 bg-brand hover:bg-brand-hover"
        >
          เลือกซื้อสินค้า
        </Button>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const totals = computeTotals({
    subtotal,
    voucher: appliedVoucher,
    paymentMethod: payment,
  });

  function set(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    const required: (keyof typeof EMPTY_FORM)[] = [
      "email",
      "recipientName",
      "recipientPhone",
      "addressLine1",
      "district",
      "province",
      "postalCode",
    ];
    for (const f of required) {
      if (!form[f].trim()) {
        toast.error("กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน");
        return;
      }
    }

    startTransition(async () => {
      const res = await placeOrder({
        ...form,
        paymentMethod: payment,
        voucherCode: appliedVoucher?.code,
        items: items.map((i) => ({
          variantId: i.variantId,
          colorId: i.colorId,
          quantity: i.quantity,
        })),
      });
      if (res.ok) {
        setPlaced(true);
        clear();
        router.push(`/checkout/success?order=${res.orderNumber}`);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* shipping */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">ข้อมูลจัดส่ง</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            ไม่ต้องสมัครสมาชิก — สั่งซื้อแบบบุคคลทั่วไปได้เลย
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="อีเมล" required className="sm:col-span-2">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="ชื่อผู้รับ" required>
              <Input
                value={form.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
              />
            </Field>
            <Field label="เบอร์โทรศัพท์" required>
              <Input
                value={form.recipientPhone}
                onChange={(e) => set("recipientPhone", e.target.value)}
                placeholder="08x-xxx-xxxx"
              />
            </Field>
            <Field label="ที่อยู่ (บ้านเลขที่ ถนน)" required className="sm:col-span-2">
              <Input
                value={form.addressLine1}
                onChange={(e) => set("addressLine1", e.target.value)}
              />
            </Field>
            <Field label="รายละเอียดเพิ่มเติม (อาคาร/หมู่)" className="sm:col-span-2">
              <Input
                value={form.addressLine2}
                onChange={(e) => set("addressLine2", e.target.value)}
              />
            </Field>
            <Field label="ตำบล / แขวง">
              <Input
                value={form.subdistrict}
                onChange={(e) => set("subdistrict", e.target.value)}
              />
            </Field>
            <Field label="อำเภอ / เขต" required>
              <Input
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
              />
            </Field>
            <Field label="จังหวัด" required>
              <Input
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
              />
            </Field>
            <Field label="รหัสไปรษณีย์" required>
              <Input
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="หมายเหตุถึงผู้จัดส่ง" className="sm:col-span-2">
              <Input
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* payment */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">วิธีการชำระเงิน</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setPayment(m.value)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  payment === m.value
                    ? "border-brand bg-brand/5 ring-1 ring-brand"
                    : "border-border hover:border-brand/50",
                )}
              >
                <m.icon className="size-5 shrink-0 text-brand" />
                <span>
                  <span className="block text-sm font-medium">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {m.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            * ขณะนี้ระบบชำระเงินอยู่ในโหมดทดสอบ — คำสั่งซื้อจะถูกบันทึกเป็น
            &quot;รอชำระเงิน&quot;
          </p>
        </section>
      </div>

      {/* review + summary */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-heading text-base font-semibold">
            รายการสินค้า ({itemCount})
          </h2>
          <ul className="mt-3 space-y-3">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={i.imageUrl}
                    alt={i.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.variantLabel}
                    {i.colorName ? ` · ${i.colorName}` : ""} × {i.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(i.unitPrice * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <OrderSummary totals={totals} itemCount={itemCount}>
          <Button
            size="lg"
            className="w-full bg-brand hover:bg-brand-hover"
            onClick={submit}
            disabled={placing}
          >
            <ShieldCheck className="size-5" />
            {placing ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 text-sm">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
