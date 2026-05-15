"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingPagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  if (pageCount <= 1) return null;

  function href(p: number) {
    const next = new URLSearchParams(sp.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      <PageLink href={href(page - 1)} disabled={page <= 1} aria-label="ก่อนหน้า">
        <ChevronLeft className="size-4" />
      </PageLink>
      {pages.map((p) => (
        <PageLink key={p} href={href(p)} active={p === page}>
          {p}
        </PageLink>
      ))}
      <PageLink
        href={href(page + 1)}
        disabled={page >= pageCount}
        aria-label="ถัดไป"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const className = cn(
    "grid h-9 min-w-9 place-items-center rounded-md border px-2 text-sm transition-colors",
    active
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border bg-card hover:border-brand",
    disabled && "pointer-events-none opacity-40",
  );
  if (disabled) {
    return (
      <span className={className} {...props}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
