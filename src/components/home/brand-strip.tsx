import Image from "next/image";
import Link from "next/link";

type BrandItem = {
  slug: string;
  name: string;
  logoUrl: string | null;
};

export function BrandStrip({ brands }: { brands: BrandItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {brands.map((b) => (
        <Link
          key={b.slug}
          href={`/category/all?brand=${b.slug}`}
          title={b.name}
          className="flex items-center justify-center rounded-lg border border-border bg-card p-4 transition-all hover:border-brand hover:shadow-sm"
        >
          {b.logoUrl ? (
            <Image
              src={b.logoUrl}
              alt={b.name}
              width={120}
              height={60}
              className="h-12 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
            />
          ) : (
            <span className="font-heading text-lg font-semibold text-primary">
              {b.name}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
