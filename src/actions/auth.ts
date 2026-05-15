"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type RegisterResult = { ok: true } | { ok: false; error: string };

// Creates a customer account and grants a welcome voucher.
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name || !email || !password) {
    return { ok: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "รูปแบบอีเมลไม่ถูกต้อง" };
  }
  if (password.length < 8) {
    return { ok: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "อีเมลนี้มีผู้ใช้งานแล้ว" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // welcome voucher for new members
  const welcome = await prisma.voucher.findUnique({
    where: { code: "WELCOME10" },
  });
  if (welcome) {
    await prisma.userVoucher.create({
      data: {
        userId: user.id,
        voucherId: welcome.id,
        source: "SIGNUP",
        expiresAt: welcome.expiresAt,
      },
    });
  }

  return { ok: true };
}

// Password reset is stubbed — email delivery is not wired up yet.
// Always reports success so the form does not reveal which emails exist.
export async function requestPasswordReset(
  email: string,
): Promise<{ ok: true }> {
  void email;
  return { ok: true };
}
