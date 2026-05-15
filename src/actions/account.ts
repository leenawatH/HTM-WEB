"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  return session.user.id;
}

export async function updateProfile(input: {
  name: string;
  phone: string;
}): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "กรุณากรอกชื่อ" };

  await prisma.user.update({
    where: { id: userId },
    data: { name, phone: input.phone.trim() || null },
  });
  revalidatePath("/account");
  return { ok: true };
}

export type AddressInput = {
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  subdistrict?: string;
  district: string;
  province: string;
  postalCode: string;
};

function cleanAddress(input: AddressInput) {
  return {
    label: input.label.trim() || "ที่อยู่",
    recipient: input.recipient.trim(),
    phone: input.phone.trim(),
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    subdistrict: input.subdistrict?.trim() || null,
    district: input.district.trim(),
    province: input.province.trim(),
    postalCode: input.postalCode.trim(),
  };
}

export async function addAddress(
  input: AddressInput,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  const data = cleanAddress(input);
  if (!data.recipient || !data.line1 || !data.district || !data.province) {
    return { ok: false, error: "กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน" };
  }
  const count = await prisma.address.count({ where: { userId } });
  await prisma.address.create({
    data: { ...data, userId, isDefault: count === 0 },
  });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  const data = cleanAddress(input);
  const result = await prisma.address.updateMany({
    where: { id, userId },
    data,
  });
  if (result.count === 0) return { ok: false, error: "ไม่พบที่อยู่" };
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  await prisma.address.deleteMany({ where: { id, userId } });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    prisma.address.updateMany({
      where: { id, userId },
      data: { isDefault: true },
    }),
  ]);
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function toggleWishlist(
  productId: string,
): Promise<{ ok: boolean; inWishlist: boolean }> {
  const userId = await requireUserId();
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { ok: true, inWishlist: false };
  }
  await prisma.wishlistItem.create({ data: { userId, productId } });
  revalidatePath("/account/wishlist");
  return { ok: true, inWishlist: true };
}
