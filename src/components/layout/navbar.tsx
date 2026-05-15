"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  PaintBucket,
  Paintbrush,
  SprayCan,
  Container,
  PaintRoller,
  Wrench,
  HardHat,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, STORE, type Locale } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AccountMenu } from "@/components/layout/account-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  PaintBucket,
  Paintbrush,
  SprayCan,
  Container,
  PaintRoller,
  Wrench,
  HardHat,
};

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems());

  // avoid hydration mismatch — cart count comes from localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  function categoryName(c: (typeof CATEGORIES)[number]) {
    return locale === "en" ? c.nameEn : c.nameTh;
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* top strip */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-9 max-w-[1280px] items-center justify-between px-4 text-xs">
          <span className="hidden items-center gap-1.5 sm:flex">
            <Phone className="size-3.5" />
            {STORE.phone}
            <span className="mx-2 opacity-40">|</span>
            {STORE.hours}
          </span>
          <span className="sm:hidden">{STORE.tagline}</span>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <AccountMenu />
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4">
        {/* mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" aria-label={t("menu")} />}
            className="lg:hidden"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="font-heading text-primary">
                {STORE.name}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {t("home")}
              </Link>
              <p className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground">
                {t("categories")}
              </p>
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c.icon] ?? PaintBucket;
                return (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    <Icon className="size-4 text-brand" />
                    {categoryName(c)}
                  </Link>
                );
              })}
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {t("about")}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <PaintBucket className="size-5" />
          </span>
          <span className="font-heading text-lg font-semibold leading-tight text-primary">
            {STORE.name}
          </span>
        </Link>

        {/* search */}
        <form
          onSubmit={submitSearch}
          className="relative ml-auto hidden max-w-md flex-1 md:block lg:ml-6"
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("search")}
          />
        </form>

        {/* actions */}
        <div className="flex items-center gap-1 md:ml-2">
          <Button
            render={<Link href="/account/wishlist" />}
            variant="ghost"
            size="icon"
            aria-label={t("wishlist")}
          >
            <Heart className="size-5" />
          </Button>
          <Button
            render={<Link href="/account" />}
            variant="ghost"
            size="icon"
            aria-label={t("account")}
          >
            <User className="size-5" />
          </Button>
          <Button
            render={<Link href="/cart" />}
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={t("cart")}
          >
            <ShoppingCart className="size-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-brand-foreground">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* category bar (desktop) */}
      <nav className="hidden border-t border-border lg:block">
        <div className="mx-auto flex h-11 max-w-[1280px] items-center gap-1 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground">
              <Menu className="size-4" />
              {t("categories")}
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c.icon] ?? PaintBucket;
                return (
                  <DropdownMenuItem
                    key={c.slug}
                    render={<Link href={`/category/${c.slug}`} />}
                  >
                    <Icon className="size-4 text-brand" />
                    {categoryName(c)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {CATEGORIES.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-foreground/80",
                "hover:bg-accent hover:text-foreground transition-colors",
              )}
            >
              {categoryName(c)}
            </Link>
          ))}
          <Link
            href="/about"
            className="ml-auto rounded-md px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            {t("about")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
