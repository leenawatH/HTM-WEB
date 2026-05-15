"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { UserCircle, LogOut, Package, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const { data: session, status } = useSession();
  const t = useTranslations("nav");

  if (status === "loading") {
    return <span className="h-4 w-16 animate-pulse rounded bg-white/20" />;
  }

  if (!session?.user) {
    return (
      <Link href="/signin" className="hover:text-brand transition-colors">
        {t("signIn")}
      </Link>
    );
  }

  const displayName = session.user.name ?? session.user.email ?? "บัญชี";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-brand transition-colors">
        <UserCircle className="size-4" />
        <span className="max-w-28 truncate">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link href="/account" />}>
          <UserCircle className="size-4" />
          {t("account")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/orders" />}>
          <Package className="size-4" />
          ประวัติคำสั่งซื้อ
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/wishlist" />}>
          <Heart className="size-4" />
          {t("wishlist")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="size-4" />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
