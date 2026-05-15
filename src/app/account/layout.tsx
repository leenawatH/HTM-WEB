import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin?callbackUrl=/account");
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        บัญชีของฉัน
      </h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <AccountNav
          userName={session.user.name}
          userEmail={session.user.email}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
