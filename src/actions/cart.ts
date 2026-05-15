"use server";

import { prisma } from "@/lib/prisma";
import type { AppliedVoucher } from "@/lib/pricing";

type VoucherResult =
  | { ok: true; voucher: AppliedVoucher }
  | { ok: false; error: string };

// Validates a promo code against the DB — used by the cart's voucher input.
export async function validateVoucher(codeRaw: string): Promise<VoucherResult> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { ok: false, error: "กรุณากรอกโค้ดส่วนลด" };

  const v = await prisma.voucher.findUnique({ where: { code } });
  if (!v || !v.isActive) {
    return { ok: false, error: "ไม่พบโค้ดส่วนลดนี้" };
  }

  const now = new Date();
  if (v.startsAt > now || v.expiresAt < now) {
    return { ok: false, error: "โค้ดส่วนลดหมดอายุแล้ว" };
  }
  if (v.usageLimit != null && v.usedCount >= v.usageLimit) {
    return { ok: false, error: "โค้ดส่วนลดถูกใช้ครบจำนวนแล้ว" };
  }

  return {
    ok: true,
    voucher: {
      code: v.code,
      type: v.type,
      value: v.value.toNumber(),
      minSpend: v.minSpend.toNumber(),
      maxDiscount: v.maxDiscount?.toNumber() ?? null,
      descriptionTh: v.descriptionTh,
    },
  };
}
