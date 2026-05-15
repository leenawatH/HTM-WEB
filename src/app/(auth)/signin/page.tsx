import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SigninForm } from "@/components/auth/signin-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/account");

  const { callbackUrl } = await searchParams;
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <SigninForm
      callbackUrl={callbackUrl || "/account"}
      googleEnabled={googleEnabled}
    />
  );
}
