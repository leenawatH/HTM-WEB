"use client";

import { useLocale } from "next-intl";
import { Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import type { ProductDetail } from "@/lib/data";
import type { Locale } from "@/lib/constants";
import { PRICING } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" });

export function ProductTabs({ product }: { product: ProductDetail }) {
  const locale = useLocale() as Locale;
  const description =
    (locale === "en" ? product.descriptionEn : product.descriptionTh) ??
    product.descriptionTh ??
    "";

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="description">รายละเอียด</TabsTrigger>
        <TabsTrigger value="specs">ข้อมูลจำเพาะ</TabsTrigger>
        <TabsTrigger value="reviews">
          รีวิว ({product.ratingCount})
        </TabsTrigger>
        <TabsTrigger value="shipping">การจัดส่ง</TabsTrigger>
      </TabsList>

      {/* description */}
      <TabsContent value="description" className="pt-5">
        <p className="text-sm leading-relaxed text-foreground/80">
          {description}
        </p>
      </TabsContent>

      {/* specs */}
      <TabsContent value="specs" className="pt-5">
        {product.specs.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {product.specs.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="w-1/3 py-2.5 pr-4 font-medium text-muted-foreground">
                    {locale === "en" ? s.labelEn : s.labelTh}
                  </td>
                  <td className="py-2.5 text-foreground">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">ไม่มีข้อมูลจำเพาะ</p>
        )}
      </TabsContent>

      {/* reviews */}
      <TabsContent value="reviews" className="pt-5">
        {product.ratingCount > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-secondary p-4">
            <span className="font-heading text-3xl font-semibold text-foreground">
              {product.ratingAvg.toFixed(1)}
            </span>
            <div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(product.ratingAvg)
                        ? "size-4 fill-amber-400 text-amber-400"
                        : "size-4 text-muted-foreground/40"
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                จาก {product.ratingCount} รีวิว
              </p>
            </div>
          </div>
        )}
        {product.reviews.length > 0 ? (
          <ul className="space-y-4">
            {product.reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {dateFmt.format(new Date(r.createdAt))}
                  </span>
                </div>
                <div className="mt-1 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < r.rating
                          ? "size-3.5 fill-amber-400 text-amber-400"
                          : "size-3.5 text-muted-foreground/40"
                      }
                    />
                  ))}
                </div>
                {r.title && (
                  <p className="mt-1 text-sm font-medium">{r.title}</p>
                )}
                <p className="mt-0.5 text-sm text-foreground/80">{r.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            ยังไม่มีรีวิวสำหรับสินค้านี้ — เป็นคนแรกที่รีวิวได้เลย
          </p>
        )}
      </TabsContent>

      {/* shipping */}
      <TabsContent value="shipping" className="pt-5">
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <Truck className="size-5 shrink-0 text-brand" />
            <span>
              ค่าจัดส่งแบบเหมาจ่าย {formatPrice(PRICING.shippingFee)} ทั่วประเทศ
              — <strong>ส่งฟรี</strong> เมื่อสั่งซื้อครบ{" "}
              {formatPrice(PRICING.freeShippingThreshold)}
            </span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="size-5 shrink-0 text-brand" />
            <span>
              เก็บเงินปลายทาง (COD) ได้ มีค่าบริการเพิ่ม{" "}
              {formatPrice(PRICING.codFee)}
            </span>
          </li>
          <li className="flex gap-3">
            <RotateCcw className="size-5 shrink-0 text-brand" />
            <span>
              เปลี่ยน/คืนสินค้าได้ภายใน 7 วัน หากสินค้าชำรุดหรือไม่ตรงตามคำสั่งซื้อ
            </span>
          </li>
        </ul>
      </TabsContent>
    </Tabs>
  );
}
