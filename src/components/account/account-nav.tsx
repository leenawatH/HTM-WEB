"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { UserRound, Package, MapPin, Ticket, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "โปรไฟล์", icon: UserRound, exact: true },
  { href: "/account/orders", label: "ประวัติคำสั่งซื้อ", icon: Package },
  { href: "/account/addresses", label: "ที่อยู่จัดส่ง", icon: MapPin },
  { href: "/account/vouchers", label: "คูปองส่วนลด", icon: Ticket },
  { href: "/account/wishlist", label: "รายการโปรด", icon: Heart },
];

export function AccountNav({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="space-y-3">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="font-heading font-semibold text-foreground">
          {userName ?? "สมาชิก"}
        </p>
        <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
      </div>

      <nav className="rounded-lg border border-border bg-card p-2">
        {LINKS.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand/10 font-medium text-brand"
                  : "text-foreground/80 hover:bg-accent",
              )}
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent"
        >
          <LogOut className="size-4" />
          ออกจากระบบ
        </button>
      </nav>
    </aside>
  );
}
