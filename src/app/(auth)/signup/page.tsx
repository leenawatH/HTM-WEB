import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "สมัครสมาชิก" };

export default async function SignupPage() {
  const session = await auth();
  if (session) redirect("/account");

  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return <SignupForm googleEnabled={googleEnabled} />;
}
