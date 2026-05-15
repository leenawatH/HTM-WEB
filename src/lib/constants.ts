// Static config — store identity, catalog taxonomy, pricing rules.

export const STORE = {
  name: "Hor Tong Mong",
  nameTh: "ฮ.ทองหมง",
  tagline: "ร้านสีและเครื่องมือช่างครบวงจร",
  taglineEn: "Paint & hardware, all in one place",
  phone: "02-123-4567",
  lineId: "@hortongmong",
  email: "contact@hortongmong.co.th",
  address: "123 ถนนช่างทอง แขวงงานสี เขตบางช่าง กรุงเทพฯ 10000",
  facebook: "https://facebook.com/hortongmong",
  hours: "จันทร์–เสาร์ 08:00–18:00 น.",
} as const;

// THB pricing rules — single source of truth for checkout math.
export const PRICING = {
  currency: "THB",
  currencySymbol: "฿",
  vatRate: 0.07, // VAT-inclusive prices; this back-computes the VAT line
  shippingFee: 50,
  freeShippingThreshold: 1000,
  codFee: 20,
} as const;

export type CategorySlug =
  | "paint"
  | "brushes"
  | "spray-guns"
  | "silicone"
  | "rollers"
  | "tools"
  | "safety";

// Lucide icon names — resolved in the UI layer.
export const CATEGORIES: {
  slug: CategorySlug;
  nameTh: string;
  nameEn: string;
  icon: string;
}[] = [
  { slug: "paint", nameTh: "สี", nameEn: "Paint", icon: "PaintBucket" },
  { slug: "brushes", nameTh: "แปรงทาสี", nameEn: "Brushes", icon: "Paintbrush" },
  { slug: "spray-guns", nameTh: "ปืนพ่นสี", nameEn: "Spray Guns", icon: "SprayCan" },
  { slug: "silicone", nameTh: "ซิลิโคน", nameEn: "Silicone", icon: "Container" },
  { slug: "rollers", nameTh: "ลูกกลิ้ง", nameEn: "Rollers", icon: "PaintRoller" },
  { slug: "tools", nameTh: "เครื่องมือช่าง", nameEn: "Tools", icon: "Wrench" },
  { slug: "safety", nameTh: "อุปกรณ์ป้องกัน", nameEn: "Safety Equipment", icon: "HardHat" },
];

export const BRANDS: { slug: string; name: string }[] = [
  { slug: "toa", name: "TOA" },
  { slug: "captain", name: "Captain" },
  { slug: "jbp", name: "JBP" },
  { slug: "qqq", name: "QQQ" },
  { slug: "3m", name: "3M" },
  { slug: "nippon", name: "Nippon Paint" },
  { slug: "dulux", name: "Dulux" },
];

export const LOCALES = ["th", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "th";
