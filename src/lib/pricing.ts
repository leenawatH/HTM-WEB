import { PRICING } from "@/lib/constants";

export type VoucherType = "PERCENT" | "FIXED" | "FREESHIP";
export type PaymentMethod = "CARD" | "PROMPTPAY" | "BANK_TRANSFER" | "COD";

export type AppliedVoucher = {
  code: string;
  type: VoucherType;
  value: number;
  minSpend: number;
  maxDiscount: number | null;
  descriptionTh: string | null;
};

export type OrderTotals = {
  subtotal: number;
  discount: number;
  shippingFee: number;
  codFee: number;
  vatAmount: number;
  grandTotal: number;
  freeShipping: boolean;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Single source of truth for checkout math. Prices are THB, VAT-inclusive.
export function computeTotals({
  subtotal,
  voucher,
  paymentMethod,
}: {
  subtotal: number;
  voucher?: AppliedVoucher | null;
  paymentMethod?: PaymentMethod;
}): OrderTotals {
  let discount = 0;
  let voucherFreeShip = false;

  if (voucher && subtotal >= voucher.minSpend) {
    if (voucher.type === "PERCENT") {
      discount = (subtotal * voucher.value) / 100;
      if (voucher.maxDiscount != null) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    } else if (voucher.type === "FIXED") {
      discount = voucher.value;
    } else if (voucher.type === "FREESHIP") {
      voucherFreeShip = true;
    }
  }
  discount = round2(Math.min(discount, subtotal));

  // free shipping by order size (pre-discount) or a FREESHIP voucher
  const qualifiesFreeShip =
    subtotal >= PRICING.freeShippingThreshold || voucherFreeShip;
  let shippingFee =
    subtotal <= 0 || qualifiesFreeShip ? 0 : PRICING.shippingFee;

  const codFee = paymentMethod === "COD" && subtotal > 0 ? PRICING.codFee : 0;

  const grandTotal = round2(subtotal - discount + shippingFee + codFee);
  // VAT-inclusive: back-compute the embedded VAT portion
  const vatAmount = round2(
    (grandTotal * PRICING.vatRate) / (1 + PRICING.vatRate),
  );

  return {
    subtotal: round2(subtotal),
    discount,
    shippingFee,
    codFee,
    vatAmount,
    grandTotal,
    freeShipping: qualifiesFreeShip,
  };
}
