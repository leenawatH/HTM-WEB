// Seed catalog data — brands, categories, and 24 sample products.
// Prices are THB, VAT-inclusive. Image paths are generated as SVG placeholders.

export type VariantSeed = {
  label: string;
  priceOverride: number;
  stock: number;
};

export type SpecSeed = {
  labelTh: string;
  labelEn: string;
  value: string;
};

export type ProductSeed = {
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  brandSlug: string;
  categorySlug: string;
  basePrice: number;
  discountPercent: number;
  isPaint: boolean;
  isFeatured: boolean;
  salesCount: number;
  ratingAvg: number;
  ratingCount: number;
  variants: VariantSeed[];
  specs: SpecSeed[];
};

export const BRAND_SEED = [
  { slug: "toa", name: "TOA", sortOrder: 1, description: "ผู้นำตลาดสีทาบ้านอันดับ 1 ของไทย" },
  { slug: "captain", name: "Captain", sortOrder: 2, description: "สีและอุปกรณ์งานช่างคุณภาพมาตรฐานสากล" },
  { slug: "jbp", name: "JBP", sortOrder: 3, description: "สีและผลิตภัณฑ์ตกแต่งพื้นผิว" },
  { slug: "qqq", name: "QQQ", sortOrder: 4, description: "เครื่องมือช่างและอุปกรณ์งานสีคุ้มค่า" },
  { slug: "3m", name: "3M", sortOrder: 5, description: "นวัตกรรมเทปกาว วัสดุยาแนว และอุปกรณ์ป้องกัน" },
  { slug: "nippon", name: "Nippon Paint", sortOrder: 6, description: "แบรนด์สีระดับโลกจากญี่ปุ่น" },
  { slug: "dulux", name: "Dulux", sortOrder: 7, description: "สีพรีเมียมเช็ดล้างได้ สีสันสดใส" },
];

export const CATEGORY_SEED = [
  { slug: "paint", nameTh: "สี", nameEn: "Paint", sortOrder: 1, descriptionTh: "สีทาบ้านภายใน-ภายนอก ทุกประเภท" },
  { slug: "brushes", nameTh: "แปรงทาสี", nameEn: "Brushes", sortOrder: 2, descriptionTh: "แปรงทาสีทุกขนาดและทุกงาน" },
  { slug: "spray-guns", nameTh: "ปืนพ่นสี", nameEn: "Spray Guns", sortOrder: 3, descriptionTh: "ปืนพ่นสีและอุปกรณ์พ่น" },
  { slug: "silicone", nameTh: "ซิลิโคน", nameEn: "Silicone", sortOrder: 4, descriptionTh: "ซิลิโคนยาแนวและกาวซีลแลนท์" },
  { slug: "rollers", nameTh: "ลูกกลิ้ง", nameEn: "Rollers", sortOrder: 5, descriptionTh: "ลูกกลิ้งทาสีและถาดสี" },
  { slug: "tools", nameTh: "เครื่องมือช่าง", nameEn: "Tools", sortOrder: 6, descriptionTh: "เครื่องมือและอุปกรณ์งานช่าง" },
  { slug: "safety", nameTh: "อุปกรณ์ป้องกัน", nameEn: "Safety Equipment", sortOrder: 7, descriptionTh: "อุปกรณ์ป้องกันส่วนบุคคลเพื่อความปลอดภัย" },
];

// representative paint-can / tool background tint per category (for SVG placeholders)
export const CATEGORY_TINT: Record<string, string> = {
  paint: "#2B4C8C",
  brushes: "#B97A3A",
  "spray-guns": "#5E8C97",
  silicone: "#7E8456",
  rollers: "#A6483C",
  tools: "#475569",
  safety: "#D97706",
};

const PAINT_VARIANTS = (l1: number, gal: number, drum: number): VariantSeed[] => [
  { label: "1 ลิตร", priceOverride: l1, stock: 60 },
  { label: "1 แกลลอน (3.785 ล.)", priceOverride: gal, stock: 40 },
  { label: "1 ถัง (18.925 ล.)", priceOverride: drum, stock: 18 },
];

export const PRODUCT_SEED: ProductSeed[] = [
  // ===================== PAINT (8) =====================
  {
    slug: "toa-supershield-exterior",
    nameTh: "TOA ซุปเปอร์ชิลด์ สีน้ำอะคริลิกภายนอก",
    nameEn: "TOA SuperShield Exterior",
    descriptionTh:
      "สีน้ำอะคริลิกสำหรับงานภายนอก ทนแดดทนฝน ปกป้องผนังจากเชื้อราและตะไคร่น้ำ ยาวนานถึง 15 ปี",
    descriptionEn:
      "Premium exterior acrylic paint with 15-year weather protection against mould and algae.",
    brandSlug: "toa",
    categorySlug: "paint",
    basePrice: 459,
    discountPercent: 15,
    isPaint: true,
    isFeatured: true,
    salesCount: 480,
    ratingAvg: 4.8,
    ratingCount: 132,
    variants: PAINT_VARIANTS(459, 1290, 3990),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก 100%" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายนอก" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "8–10 ตร.ม./ลิตร" },
      { labelTh: "เวลาแห้ง", labelEn: "Drying time", value: "ทาทับได้ใน 2 ชม." },
    ],
  },
  {
    slug: "toa-4seasons-interior",
    nameTh: "TOA โฟร์ซีซั่นส์ สีน้ำภายใน",
    nameEn: "TOA 4 Seasons Interior",
    descriptionTh:
      "สีน้ำภายในเกรดพรีเมียม กลิ่นอ่อน เช็ดทำความสะอาดง่าย ให้ผิวฟิล์มเนียนเรียบสวยงาม",
    descriptionEn:
      "Premium low-odour interior paint with a smooth washable finish.",
    brandSlug: "toa",
    categorySlug: "paint",
    basePrice: 329,
    discountPercent: 0,
    isPaint: true,
    isFeatured: true,
    salesCount: 365,
    ratingAvg: 4.7,
    ratingCount: 98,
    variants: PAINT_VARIANTS(329, 990, 2890),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายใน" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "9–11 ตร.ม./ลิตร" },
      { labelTh: "ระดับความเงา", labelEn: "Sheen", value: "กึ่งเงา" },
    ],
  },
  {
    slug: "captain-studioshield-interior",
    nameTh: "Captain สตูดิโอชิลด์ สีน้ำด้านภายใน",
    nameEn: "Captain Studio Shield Interior Matt",
    descriptionTh:
      "สีน้ำด้านภายในสำหรับงานตกแต่ง ปกปิดรอยตำหนิได้ดี สีสันคมชัด เหมาะกับห้องนั่งเล่นและห้องนอน",
    descriptionEn:
      "Matt interior paint that hides surface imperfections — ideal for living rooms and bedrooms.",
    brandSlug: "captain",
    categorySlug: "paint",
    basePrice: 299,
    discountPercent: 10,
    isPaint: true,
    isFeatured: true,
    salesCount: 290,
    ratingAvg: 4.6,
    ratingCount: 74,
    variants: PAINT_VARIANTS(299, 920, 2690),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก ด้าน" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายใน" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "8–10 ตร.ม./ลิตร" },
      { labelTh: "เวลาแห้ง", labelEn: "Drying time", value: "ทาทับได้ใน 2 ชม." },
    ],
  },
  {
    slug: "captain-longlife-exterior",
    nameTh: "Captain ลองไลฟ์ สีน้ำอะคริลิกภายนอก",
    nameEn: "Captain Longlife Exterior",
    descriptionTh:
      "สีน้ำภายนอกสูตรทนทาน ยืดหยุ่นสูง ป้องกันรอยแตกลายงา ทนต่อสภาพอากาศเมืองไทย",
    descriptionEn:
      "Durable, highly flexible exterior paint that resists hairline cracks.",
    brandSlug: "captain",
    categorySlug: "paint",
    basePrice: 399,
    discountPercent: 0,
    isPaint: true,
    isFeatured: false,
    salesCount: 210,
    ratingAvg: 4.5,
    ratingCount: 61,
    variants: PAINT_VARIANTS(399, 1150, 3490),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก 100%" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายนอก" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "8–9 ตร.ม./ลิตร" },
      { labelTh: "การรับประกัน", labelEn: "Warranty", value: "ฟิล์มสี 12 ปี" },
    ],
  },
  {
    slug: "jbp-acrylic-allpurpose",
    nameTh: "JBP สีน้ำอะคริลิก ภายใน-ภายนอก",
    nameEn: "JBP Acrylic All-Purpose",
    descriptionTh:
      "สีน้ำอเนกประสงค์ ใช้ได้ทั้งภายในและภายนอก คุ้มค่า เหมาะกับงานทาสีทั่วไป",
    descriptionEn:
      "Versatile interior/exterior acrylic paint — great value for general work.",
    brandSlug: "jbp",
    categorySlug: "paint",
    basePrice: 259,
    discountPercent: 20,
    isPaint: true,
    isFeatured: false,
    salesCount: 175,
    ratingAvg: 4.3,
    ratingCount: 44,
    variants: PAINT_VARIANTS(259, 790, 2390),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายใน-ภายนอก" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "7–9 ตร.ม./ลิตร" },
      { labelTh: "เวลาแห้ง", labelEn: "Drying time", value: "ทาทับได้ใน 2–3 ชม." },
    ],
  },
  {
    slug: "nippon-weatherbond-exterior",
    nameTh: "Nippon Paint เวเธอร์บอนด์ สีภายนอก",
    nameEn: "Nippon Paint Weatherbond Exterior",
    descriptionTh:
      "สีน้ำภายนอกเทคโนโลยีญี่ปุ่น สะท้อนความร้อน ช่วยให้บ้านเย็นสบาย ทนทานยาวนาน",
    descriptionEn:
      "Japanese-tech exterior paint with heat-reflective technology to keep homes cooler.",
    brandSlug: "nippon",
    categorySlug: "paint",
    basePrice: 489,
    discountPercent: 0,
    isPaint: true,
    isFeatured: true,
    salesCount: 320,
    ratingAvg: 4.8,
    ratingCount: 107,
    variants: PAINT_VARIANTS(489, 1390, 4190),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก สะท้อนความร้อน" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายนอก" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "8–10 ตร.ม./ลิตร" },
      { labelTh: "การรับประกัน", labelEn: "Warranty", value: "ฟิล์มสี 15 ปี" },
    ],
  },
  {
    slug: "dulux-easyclean-interior",
    nameTh: "Dulux อีซี่คลีน สีภายในเช็ดล้างได้",
    nameEn: "Dulux EasyClean Interior",
    descriptionTh:
      "สีน้ำภายในเช็ดล้างคราบสกปรกได้ง่าย สีสันสดใส เหมาะกับบ้านที่มีเด็กเล็ก",
    descriptionEn:
      "Washable interior paint with vivid colours — perfect for homes with kids.",
    brandSlug: "dulux",
    categorySlug: "paint",
    basePrice: 419,
    discountPercent: 12,
    isPaint: true,
    isFeatured: true,
    salesCount: 268,
    ratingAvg: 4.7,
    ratingCount: 89,
    variants: PAINT_VARIANTS(419, 1240, 3690),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก เช็ดล้างได้" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายใน" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "9–11 ตร.ม./ลิตร" },
      { labelTh: "ระดับความเงา", labelEn: "Sheen", value: "กึ่งเงา" },
    ],
  },
  {
    slug: "qqq-acrylic-economy",
    nameTh: "QQQ สีน้ำอะคริลิก อเนกประสงค์",
    nameEn: "QQQ Acrylic Economy",
    descriptionTh:
      "สีน้ำราคาประหยัด เหมาะกับงานทาสีบริเวณกว้าง งบจำกัด ให้สีเรียบสม่ำเสมอ",
    descriptionEn:
      "Budget-friendly acrylic paint for large areas — even, consistent coverage.",
    brandSlug: "qqq",
    categorySlug: "paint",
    basePrice: 189,
    discountPercent: 0,
    isPaint: true,
    isFeatured: false,
    salesCount: 140,
    ratingAvg: 4.1,
    ratingCount: 33,
    variants: PAINT_VARIANTS(189, 520, 1690),
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "สีน้ำอะคริลิก" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายใน-ภายนอก" },
      { labelTh: "การปกปิด", labelEn: "Coverage", value: "6–8 ตร.ม./ลิตร" },
      { labelTh: "เวลาแห้ง", labelEn: "Drying time", value: "ทาทับได้ใน 3 ชม." },
    ],
  },

  // ===================== BRUSHES (3) =====================
  {
    slug: "toa-brush-soft",
    nameTh: "แปรงทาสี TOA ขนเอ็นนุ่ม",
    nameEn: "TOA Soft Filament Brush",
    descriptionTh:
      "แปรงทาสีขนเอ็นนุ่ม เก็บงานเรียบเนียน ไม่ทิ้งรอยแปรง ด้ามจับกระชับมือ",
    descriptionEn:
      "Soft filament brush for a smooth, streak-free finish with an ergonomic handle.",
    brandSlug: "toa",
    categorySlug: "brushes",
    basePrice: 39,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 410,
    ratingAvg: 4.6,
    ratingCount: 120,
    variants: [
      { label: "1 นิ้ว", priceOverride: 39, stock: 200 },
      { label: "2 นิ้ว", priceOverride: 59, stock: 180 },
      { label: "3 นิ้ว", priceOverride: 85, stock: 150 },
      { label: "4 นิ้ว", priceOverride: 119, stock: 90 },
    ],
    specs: [
      { labelTh: "ชนิดขนแปรง", labelEn: "Bristle", value: "ขนเอ็นสังเคราะห์" },
      { labelTh: "เหมาะกับ", labelEn: "Best for", value: "สีน้ำและสีน้ำมัน" },
      { labelTh: "ด้ามจับ", labelEn: "Handle", value: "ไม้เคลือบเงา" },
    ],
  },
  {
    slug: "captain-brush-pro",
    nameTh: "แปรงทาสีกัปตัน รุ่นงานช่าง",
    nameEn: "Captain Pro Tradesman Brush",
    descriptionTh:
      "แปรงทาสีสำหรับช่างมืออาชีพ ขนแปรงแน่น อุ้มสีได้มาก ทนทานต่อการใช้งานหนัก",
    descriptionEn:
      "Professional-grade brush with dense bristles that hold more paint.",
    brandSlug: "captain",
    categorySlug: "brushes",
    basePrice: 49,
    discountPercent: 10,
    isPaint: false,
    isFeatured: true,
    salesCount: 330,
    ratingAvg: 4.7,
    ratingCount: 95,
    variants: [
      { label: "2 นิ้ว", priceOverride: 49, stock: 160 },
      { label: "3 นิ้ว", priceOverride: 75, stock: 140 },
      { label: "4 นิ้ว", priceOverride: 105, stock: 80 },
    ],
    specs: [
      { labelTh: "ชนิดขนแปรง", labelEn: "Bristle", value: "ขนผสมพิเศษ" },
      { labelTh: "เหมาะกับ", labelEn: "Best for", value: "งานทาสีพื้นที่กว้าง" },
      { labelTh: "ด้ามจับ", labelEn: "Handle", value: "พลาสติกกันลื่น" },
    ],
  },
  {
    slug: "jbp-brush-angled",
    nameTh: "แปรงตัดเส้น JBP ปลายเฉียง",
    nameEn: "JBP Angled Sash Brush",
    descriptionTh:
      "แปรงปลายเฉียงสำหรับงานตัดเส้นและเก็บมุม ควบคุมเส้นสีได้แม่นยำ",
    descriptionEn:
      "Angled sash brush for precise cutting-in and edges.",
    brandSlug: "jbp",
    categorySlug: "brushes",
    basePrice: 65,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 150,
    ratingAvg: 4.4,
    ratingCount: 38,
    variants: [
      { label: '1.5 นิ้ว', priceOverride: 65, stock: 120 },
      { label: "2.5 นิ้ว", priceOverride: 89, stock: 100 },
    ],
    specs: [
      { labelTh: "ชนิดขนแปรง", labelEn: "Bristle", value: "ขนเอ็นปลายเรียว" },
      { labelTh: "เหมาะกับ", labelEn: "Best for", value: "งานตัดเส้น เก็บมุม" },
      { labelTh: "รูปทรง", labelEn: "Shape", value: "ปลายเฉียง" },
    ],
  },

  // ===================== SPRAY GUNS (2) =====================
  {
    slug: "qqq-spraygun-hvlp",
    nameTh: "ปืนพ่นสี QQQ ระบบ HVLP",
    nameEn: "QQQ HVLP Spray Gun",
    descriptionTh:
      "ปืนพ่นสีระบบ HVLP ละอองสีฟุ้งน้อย ประหยัดสี ปรับลายพ่นได้ 3 รูปแบบ",
    descriptionEn:
      "HVLP spray gun — low overspray, paint-saving, with 3 adjustable patterns.",
    brandSlug: "qqq",
    categorySlug: "spray-guns",
    basePrice: 890,
    discountPercent: 15,
    isPaint: false,
    isFeatured: true,
    salesCount: 95,
    ratingAvg: 4.5,
    ratingCount: 41,
    variants: [{ label: "ถ้วยบน 600 มล.", priceOverride: 890, stock: 35 }],
    specs: [
      { labelTh: "ระบบ", labelEn: "System", value: "HVLP" },
      { labelTh: "ขนาดหัวพ่น", labelEn: "Nozzle", value: "1.4 มม." },
      { labelTh: "ความจุถ้วย", labelEn: "Cup", value: "600 มล." },
      { labelTh: "แรงดันใช้งาน", labelEn: "Pressure", value: "2–3.5 บาร์" },
    ],
  },
  {
    slug: "3m-spraygun-pro",
    nameTh: "ปืนพ่นสีลม 3M รุ่นมืออาชีพ",
    nameEn: "3M Professional Air Spray Gun",
    descriptionTh:
      "ปืนพ่นสีลมเกรดมืออาชีพ ตัวเรือนอลูมิเนียม น้ำหนักเบา ให้ผิวงานเรียบเนียน",
    descriptionEn:
      "Professional air spray gun with a lightweight aluminium body for a flawless finish.",
    brandSlug: "3m",
    categorySlug: "spray-guns",
    basePrice: 2490,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 60,
    ratingAvg: 4.8,
    ratingCount: 27,
    variants: [{ label: "ถ้วยล่าง 1000 มล.", priceOverride: 2490, stock: 14 }],
    specs: [
      { labelTh: "ระบบ", labelEn: "System", value: "พ่นลม (Conventional)" },
      { labelTh: "ขนาดหัวพ่น", labelEn: "Nozzle", value: "1.8 มม." },
      { labelTh: "วัสดุตัวเรือน", labelEn: "Body", value: "อลูมิเนียมชุบ" },
      { labelTh: "ความจุถ้วย", labelEn: "Cup", value: "1000 มล." },
    ],
  },

  // ===================== SILICONE (3) =====================
  {
    slug: "3m-silicone-multipurpose",
    nameTh: "ซิลิโคนยาแนว 3M อเนกประสงค์",
    nameEn: "3M Multipurpose Silicone Sealant",
    descriptionTh:
      "ซิลิโคนยาแนวอเนกประสงค์ ยืดหยุ่นสูง กันน้ำ กันรา เหมาะกับงานห้องน้ำและกระจก",
    descriptionEn:
      "Flexible waterproof, mould-resistant silicone — ideal for bathrooms and glass.",
    brandSlug: "3m",
    categorySlug: "silicone",
    basePrice: 145,
    discountPercent: 0,
    isPaint: false,
    isFeatured: true,
    salesCount: 380,
    ratingAvg: 4.7,
    ratingCount: 112,
    variants: [
      { label: "หลอด 300 มล. — ใส", priceOverride: 145, stock: 220 },
      { label: "หลอด 300 มล. — ขาว", priceOverride: 145, stock: 200 },
    ],
    specs: [
      { labelTh: "ชนิด", labelEn: "Type", value: "ซิลิโคนกรด" },
      { labelTh: "คุณสมบัติ", labelEn: "Feature", value: "กันน้ำ กันรา" },
      { labelTh: "เวลาแห้งผิว", labelEn: "Skin time", value: "10–15 นาที" },
    ],
  },
  {
    slug: "toa-silicone-waterproof",
    nameTh: "TOA ซิลิโคนกันน้ำ",
    nameEn: "TOA Waterproof Silicone",
    descriptionTh:
      "ซิลิโคนกันน้ำสูตรพิเศษ ยึดเกาะแน่น ทนแดดทนฝน เหมาะกับงานภายนอก",
    descriptionEn:
      "Special waterproof silicone with strong adhesion for outdoor use.",
    brandSlug: "toa",
    categorySlug: "silicone",
    basePrice: 159,
    discountPercent: 10,
    isPaint: false,
    isFeatured: false,
    salesCount: 240,
    ratingAvg: 4.5,
    ratingCount: 67,
    variants: [
      { label: "หลอด 300 มล. — ใส", priceOverride: 159, stock: 180 },
      { label: "หลอด 300 มล. — ขาว", priceOverride: 159, stock: 160 },
    ],
    specs: [
      { labelTh: "ชนิด", labelEn: "Type", value: "ซิลิโคนกลาง" },
      { labelTh: "คุณสมบัติ", labelEn: "Feature", value: "กันน้ำ ทนแดด" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "ภายใน-ภายนอก" },
    ],
  },
  {
    slug: "captain-acrylic-sealant",
    nameTh: "กัปตัน อะคริลิกซีลแลนท์",
    nameEn: "Captain Acrylic Sealant",
    descriptionTh:
      "กาวยาแนวอะคริลิก ทาสีทับได้ เหมาะกับการอุดรอยแตกร้าวก่อนทาสี",
    descriptionEn:
      "Paintable acrylic sealant for filling cracks before painting.",
    brandSlug: "captain",
    categorySlug: "silicone",
    basePrice: 95,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 200,
    ratingAvg: 4.4,
    ratingCount: 52,
    variants: [{ label: "หลอด 300 มล. — ขาว", priceOverride: 95, stock: 240 }],
    specs: [
      { labelTh: "ชนิด", labelEn: "Type", value: "อะคริลิกซีลแลนท์" },
      { labelTh: "คุณสมบัติ", labelEn: "Feature", value: "ทาสีทับได้" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "อุดรอยแตกร้าว" },
    ],
  },

  // ===================== ROLLERS (3) =====================
  {
    slug: "toa-roller-short",
    nameTh: "ลูกกลิ้งทาสี TOA ขนสั้น",
    nameEn: "TOA Short-Pile Roller",
    descriptionTh:
      "ลูกกลิ้งทาสีขนสั้น ให้ผิวงานเรียบเนียน เหมาะกับผนังเรียบและงานสีน้ำ",
    descriptionEn:
      "Short-pile roller for a smooth finish on flat walls.",
    brandSlug: "toa",
    categorySlug: "rollers",
    basePrice: 89,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 300,
    ratingAvg: 4.5,
    ratingCount: 78,
    variants: [
      { label: "7 นิ้ว", priceOverride: 89, stock: 160 },
      { label: "10 นิ้ว", priceOverride: 129, stock: 120 },
    ],
    specs: [
      { labelTh: "ความยาวขน", labelEn: "Pile", value: "ขนสั้น 5 มม." },
      { labelTh: "เหมาะกับ", labelEn: "Best for", value: "ผนังเรียบ" },
      { labelTh: "วัสดุขน", labelEn: "Material", value: "ไมโครไฟเบอร์" },
    ],
  },
  {
    slug: "captain-roller-set",
    nameTh: "ชุดลูกกลิ้งทาสีกัปตัน พร้อมถาดสี",
    nameEn: "Captain Roller Set with Tray",
    descriptionTh:
      "ชุดลูกกลิ้งทาสีพร้อมถาดสีและด้ามจับ ครบชุดพร้อมใช้งาน คุ้มค่า",
    descriptionEn:
      "Complete roller kit with paint tray and handle — ready to use.",
    brandSlug: "captain",
    categorySlug: "rollers",
    basePrice: 199,
    discountPercent: 15,
    isPaint: false,
    isFeatured: true,
    salesCount: 260,
    ratingAvg: 4.6,
    ratingCount: 84,
    variants: [{ label: "ชุด 9 นิ้ว", priceOverride: 199, stock: 90 }],
    specs: [
      { labelTh: "ในชุด", labelEn: "Includes", value: "ลูกกลิ้ง + ถาด + ด้าม" },
      { labelTh: "ความยาวขน", labelEn: "Pile", value: "ขนกลาง 9 มม." },
      { labelTh: "เหมาะกับ", labelEn: "Best for", value: "ผนังทั่วไป" },
    ],
  },
  {
    slug: "jbp-roller-ceiling",
    nameTh: "ลูกกลิ้งงานฝ้า JBP",
    nameEn: "JBP Ceiling Roller",
    descriptionTh:
      "ลูกกลิ้งสำหรับงานฝ้าเพดาน ขนหนาอุ้มสีดี ลดการกระเด็นของสี",
    descriptionEn:
      "Thick-pile ceiling roller that holds paint well and reduces splatter.",
    brandSlug: "jbp",
    categorySlug: "rollers",
    basePrice: 109,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 130,
    ratingAvg: 4.3,
    ratingCount: 29,
    variants: [
      { label: "7 นิ้ว", priceOverride: 109, stock: 100 },
      { label: "10 นิ้ว", priceOverride: 149, stock: 70 },
    ],
    specs: [
      { labelTh: "ความยาวขน", labelEn: "Pile", value: "ขนยาว 12 มม." },
      { labelTh: "เหมาะกับ", labelEn: "Best for", value: "ฝ้าเพดาน ผิวหยาบ" },
      { labelTh: "วัสดุขน", labelEn: "Material", value: "โพลีเอสเตอร์" },
    ],
  },

  // ===================== TOOLS (3) =====================
  {
    slug: "3m-masking-tape",
    nameTh: "เทปกาวย่นงานสี 3M",
    nameEn: "3M Masking Tape",
    descriptionTh:
      "เทปกาวย่นสำหรับงานสี ลอกออกง่ายไม่ทิ้งคราบกาว ให้เส้นสีคมชัด",
    descriptionEn:
      "Painter's masking tape — clean removal, sharp paint lines.",
    brandSlug: "3m",
    categorySlug: "tools",
    basePrice: 45,
    discountPercent: 0,
    isPaint: false,
    isFeatured: true,
    salesCount: 520,
    ratingAvg: 4.8,
    ratingCount: 156,
    variants: [
      { label: "24 มม. x 20 ม.", priceOverride: 45, stock: 300 },
      { label: "36 มม. x 20 ม.", priceOverride: 65, stock: 240 },
      { label: "48 มม. x 20 ม.", priceOverride: 89, stock: 160 },
    ],
    specs: [
      { labelTh: "วัสดุ", labelEn: "Material", value: "กระดาษย่น" },
      { labelTh: "การลอก", labelEn: "Removal", value: "ลอกสะอาดภายใน 24 ชม." },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "งานสี ปิดขอบ" },
    ],
  },
  {
    slug: "qqq-putty-knife",
    nameTh: "เกรียงโป๊วสแตนเลส QQQ",
    nameEn: "QQQ Stainless Putty Knife",
    descriptionTh:
      "เกรียงโป๊วใบสแตนเลส ยืดหยุ่นดี ด้ามจับกระชับ เหมาะกับงานโป๊วและขูดสีเก่า",
    descriptionEn:
      "Flexible stainless putty knife for filling and scraping old paint.",
    brandSlug: "qqq",
    categorySlug: "tools",
    basePrice: 59,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 240,
    ratingAvg: 4.4,
    ratingCount: 56,
    variants: [
      { label: "2 นิ้ว", priceOverride: 59, stock: 180 },
      { label: "4 นิ้ว", priceOverride: 85, stock: 140 },
    ],
    specs: [
      { labelTh: "วัสดุใบ", labelEn: "Blade", value: "สแตนเลส" },
      { labelTh: "ด้ามจับ", labelEn: "Handle", value: "พลาสติกกันลื่น" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "โป๊ว ขูดสี" },
    ],
  },
  {
    slug: "captain-sandpaper-set",
    nameTh: "กระดาษทรายขัด ชุดรวมเบอร์ Captain",
    nameEn: "Captain Assorted Sandpaper Set",
    descriptionTh:
      "ชุดกระดาษทรายขัดรวมหลายเบอร์ สำหรับเตรียมพื้นผิวก่อนทาสี ขัดได้ทั้งงานหยาบและละเอียด",
    descriptionEn:
      "Assorted-grit sandpaper set for surface prep before painting.",
    brandSlug: "captain",
    categorySlug: "tools",
    basePrice: 119,
    discountPercent: 10,
    isPaint: false,
    isFeatured: false,
    salesCount: 190,
    ratingAvg: 4.5,
    ratingCount: 47,
    variants: [
      { label: "ชุดเล็ก (10 แผ่น)", priceOverride: 119, stock: 130 },
      { label: "ชุดใหญ่ (30 แผ่น)", priceOverride: 299, stock: 70 },
    ],
    specs: [
      { labelTh: "เบอร์ทราย", labelEn: "Grit", value: "80 / 120 / 240 / 400" },
      { labelTh: "ขนาดแผ่น", labelEn: "Sheet size", value: "23 x 28 ซม." },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "เตรียมพื้นผิว" },
    ],
  },

  // ===================== SAFETY (2) =====================
  {
    slug: "3m-respirator",
    nameTh: "หน้ากากกันสารเคมี 3M",
    nameEn: "3M Chemical Respirator",
    descriptionTh:
      "หน้ากากกันสารเคมีและไอระเหยจากสี พร้อมตลับกรอง สวมใส่สบาย ปกป้องระบบทางเดินหายใจ",
    descriptionEn:
      "Chemical respirator with filter cartridges — comfortable protection against paint fumes.",
    brandSlug: "3m",
    categorySlug: "safety",
    basePrice: 1290,
    discountPercent: 20,
    isPaint: false,
    isFeatured: true,
    salesCount: 175,
    ratingAvg: 4.9,
    ratingCount: 88,
    variants: [
      { label: "ไซส์ M", priceOverride: 1290, stock: 50 },
      { label: "ไซส์ L", priceOverride: 1290, stock: 40 },
    ],
    specs: [
      { labelTh: "ประเภท", labelEn: "Type", value: "หน้ากากครึ่งหน้า" },
      { labelTh: "ตลับกรอง", labelEn: "Filter", value: "กรองไอสารเคมีอินทรีย์" },
      { labelTh: "มาตรฐาน", labelEn: "Standard", value: "ผ่านมาตรฐานความปลอดภัย" },
    ],
  },
  {
    slug: "qqq-safety-kit",
    nameTh: "ชุดอุปกรณ์ป้องกัน QQQ",
    nameEn: "QQQ Safety Kit",
    descriptionTh:
      "ชุดอุปกรณ์ป้องกันสำหรับงานสี ประกอบด้วยแว่นตานิรภัย ถุงมือ และหน้ากากกันฝุ่น",
    descriptionEn:
      "Safety kit for painting work — safety glasses, gloves and a dust mask.",
    brandSlug: "qqq",
    categorySlug: "safety",
    basePrice: 359,
    discountPercent: 0,
    isPaint: false,
    isFeatured: false,
    salesCount: 145,
    ratingAvg: 4.3,
    ratingCount: 36,
    variants: [
      { label: "ไซส์ M", priceOverride: 359, stock: 80 },
      { label: "ไซส์ L", priceOverride: 359, stock: 60 },
    ],
    specs: [
      { labelTh: "ในชุด", labelEn: "Includes", value: "แว่นตา + ถุงมือ + หน้ากากกันฝุ่น" },
      { labelTh: "การใช้งาน", labelEn: "Use", value: "งานสี งานช่างทั่วไป" },
      { labelTh: "วัสดุถุงมือ", labelEn: "Glove", value: "ผ้าเคลือบยาง" },
    ],
  },
];
