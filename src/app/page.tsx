import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  PaintBucket,
  Paintbrush,
  SprayCan,
  Container,
  PaintRoller,
  Wrench,
  HardHat,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, STORE, type Locale } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  PaintBucket,
  Paintbrush,
  SprayCan,
  Container,
  PaintRoller,
  Wrench,
  HardHat,
};

export default function Home() {
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <div>
      {/* hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 px-4 py-20 sm:py-28">
          <span className="rounded-full bg-brand/15 px-3 py-1 text-sm font-medium text-brand">
            🎨 ทดลองสีบนผนังจริงผ่านกล้อง
          </span>
          <h1 className="max-w-2xl font-heading text-4xl font-semibold leading-tight sm:text-5xl">
            {STORE.tagline}
          </h1>
          <p className="max-w-xl text-primary-foreground/70">
            {STORE.taglineEn} — สี เครื่องมือช่าง อุปกรณ์ครบ จากแบรนด์ชั้นนำ
            พร้อมส่งถึงบ้าน
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href="/category/paint" />}
              size="lg"
              className="bg-brand hover:bg-brand-hover"
            >
              {t("shopNow")}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              render={<Link href="/about" />}
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {tNav("about")}
            </Button>
          </div>
        </div>
      </section>

      {/* shop by category */}
      <section className="mx-auto max-w-[1280px] px-4 py-16">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          เลือกซื้อตามหมวดหมู่
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shop by category
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] ?? PaintBucket;
            return (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-colors hover:border-brand"
              >
                <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-7" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {locale === "en" ? c.nameEn : c.nameTh}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
