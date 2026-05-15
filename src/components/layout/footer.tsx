import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { PaintBucket, Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import { CATEGORIES, STORE, type Locale } from "@/lib/constants";

const PAYMENT_METHODS = ["Visa", "Mastercard", "PromptPay", "COD", "โอนเงิน"];

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* about */}
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-md bg-brand text-brand-foreground">
              <PaintBucket className="size-5" />
            </span>
            <span className="font-heading text-lg font-semibold">
              {STORE.name}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            {t("aboutText")}
          </p>
          <a
            href={STORE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-brand transition-colors"
          >
            <ExternalLink className="size-4" />
            Facebook
          </a>
        </div>

        {/* shop */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide">
            {t("categories")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="text-primary-foreground/70 hover:text-brand transition-colors"
                >
                  {locale === "en" ? c.nameEn : c.nameTh}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* customer service */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide">
            {t("customerService")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link
                href="/about"
                className="text-primary-foreground/70 hover:text-brand transition-colors"
              >
                {tNav("about")}
              </Link>
            </li>
            <li>
              <Link
                href="/account/orders"
                className="text-primary-foreground/70 hover:text-brand transition-colors"
              >
                {t("trackOrder")}
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="text-primary-foreground/70 hover:text-brand transition-colors"
              >
                {tNav("cart")}
              </Link>
            </li>
            <li>
              <span className="text-primary-foreground/70">
                {t("shipping")}
              </span>
            </li>
            <li>
              <span className="text-primary-foreground/70">{t("returns")}</span>
            </li>
          </ul>
        </div>

        {/* contact */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide">
            {t("contactUs")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              {STORE.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-brand" />
              {STORE.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-brand" />
              {STORE.email}
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 shrink-0 text-brand" />
              {STORE.hours}
            </li>
          </ul>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {STORE.name}. {t("rights")}.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground/50">{t("payments")}:</span>
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m}
                className="rounded border border-primary-foreground/15 bg-primary-foreground/5 px-2 py-1"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
