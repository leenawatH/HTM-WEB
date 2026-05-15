import { Camera, Truck, BadgeCheck, Wallet } from "lucide-react";
import {
  getFeaturedProducts,
  getCategoriesWithCount,
  getBrands,
} from "@/lib/data";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { CategoryGrid } from "@/components/home/category-grid";
import { BrandStrip } from "@/components/home/brand-strip";
import { ProductGrid } from "@/components/product/product-grid";

const FEATURES = [
  { icon: Camera, title: "ทดลองสีก่อนซื้อ", text: "ทาสีบนผนังจริงผ่านกล้อง" },
  { icon: Truck, title: "ส่งฟรี ฿1,000 ขึ้นไป", text: "จัดส่งทั่วประเทศ" },
  { icon: BadgeCheck, title: "7 แบรนด์ชั้นนำ", text: "TOA, Nippon, Dulux และอื่นๆ" },
  { icon: Wallet, title: "ชำระปลายทางได้", text: "บัตรเครดิต, PromptPay, COD" },
];

export default async function Home() {
  const [featured, categories, brands] = await Promise.all([
    getFeaturedProducts(8),
    getCategoriesWithCount(),
    getBrands(),
  ]);

  return (
    <div>
      <HeroCarousel />

      {/* trust strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-brand">
                <f.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {f.title}
                </p>
                <p className="text-xs text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* recommended */}
      <section className="mx-auto max-w-[1280px] px-4 py-14">
        <SectionHeading
          title="สินค้าแนะนำ"
          subtitle="สินค้ายอดนิยมและกำลังลดราคา"
          viewAllHref="/category/all"
        />
        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* categories */}
      <section className="bg-card py-14">
        <div className="mx-auto max-w-[1280px] px-4">
          <SectionHeading
            title="เลือกซื้อตามหมวดหมู่"
            subtitle="Shop by category"
          />
          <div className="mt-8">
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      {/* partner brands */}
      <section id="brands" className="mx-auto max-w-[1280px] scroll-mt-28 px-4 py-14">
        <SectionHeading
          title="แบรนด์พันธมิตร"
          subtitle="คลิกที่แบรนด์เพื่อดูสินค้าทั้งหมดของแบรนด์นั้น"
        />
        <div className="mt-8">
          <BrandStrip brands={brands} />
        </div>
      </section>
    </div>
  );
}
