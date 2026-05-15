import Link from "next/link";
import { useLocale } from "next-intl";
import {
  PaintBucket,
  Paintbrush,
  SprayCan,
  Container,
  PaintRoller,
  Wrench,
  HardHat,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, type Locale } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  PaintBucket,
  Paintbrush,
  SprayCan,
  Container,
  PaintRoller,
  Wrench,
  HardHat,
};

type CategoryItem = {
  slug: string;
  nameTh: string;
  nameEn: string;
  productCount: number;
};

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  const locale = useLocale() as Locale;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
      {categories.map((c) => {
        const iconName = CATEGORIES.find((x) => x.slug === c.slug)?.icon;
        const Icon = (iconName && ICONS[iconName]) || PaintBucket;
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
            <span className="text-xs text-muted-foreground">
              {c.productCount} รายการ
            </span>
          </Link>
        );
      })}
    </div>
  );
}
