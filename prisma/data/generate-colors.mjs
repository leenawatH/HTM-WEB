// Generates representative paint colour charts (hybrid data) for each brand.
// Output: prisma/data/colors/<brand>.json — swap these for official decks later.
// Run: node prisma/data/generate-colors.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "colors");

// --- base palette: 40 house-paint colours grouped by family --------------
const BASE = [
  // neutral
  ["Pure White", "ขาวบริสุทธิ์", "#F7F6F1", "neutral"],
  ["Cotton White", "ขาวนวล", "#EFEDE3", "neutral"],
  ["Warm Ivory", "สีงาช้าง", "#E9E2D0", "neutral"],
  ["Soft Almond", "อัลมอนด์", "#DED4BE", "neutral"],
  ["Pale Linen", "ลินินอ่อน", "#D8CFC0", "neutral"],
  ["Misty Grey", "เทาหมอก", "#C7C6C2", "neutral"],
  ["Pebble Grey", "เทากรวด", "#ABAAA4", "neutral"],
  ["Charcoal Smoke", "เทาถ่าน", "#6E6E69", "neutral"],
  // warm
  ["Sunlight Yellow", "เหลืองแสงแดด", "#F4D06A", "warm"],
  ["Golden Sand", "ทรายทอง", "#E8C07A", "warm"],
  ["Apricot Glow", "แอปริคอต", "#EFB07A", "warm"],
  ["Mango Tango", "มะม่วงสุก", "#ED9D4E", "warm"],
  ["Coral Blush", "ปะการัง", "#E08E84", "warm"],
  ["Terracotta", "ดินเผา", "#C8745A", "warm"],
  ["Brick Red", "แดงอิฐ", "#A6483C", "warm"],
  ["Chili Red", "แดงพริก", "#B23A33", "warm"],
  // earth
  ["Latte Beige", "ลาเต้", "#C9B49A", "earth"],
  ["Khaki Earth", "กากี", "#9A8C6A", "earth"],
  ["Taupe Mocha", "โมคา", "#A38C72", "earth"],
  ["Clay Brown", "น้ำตาลดินเหนียว", "#8F6F55", "earth"],
  ["Cocoa Brown", "โกโก้", "#7C6450", "earth"],
  ["Walnut", "วอลนัท", "#5E4B3C", "earth"],
  // green
  ["Lime Zest", "เขียวมะนาว", "#C2CE7B", "green"],
  ["Mint Breeze", "เขียวมินต์", "#BDD6C0", "green"],
  ["Sage Green", "เขียวเซจ", "#A7B79A", "green"],
  ["Eucalyptus", "ยูคาลิปตัส", "#8FAE9B", "green"],
  ["Olive Grove", "เขียวมะกอก", "#7E8456", "green"],
  ["Forest Green", "เขียวป่า", "#4A6149", "green"],
  // blue
  ["Sky Mist", "ฟ้าหมอก", "#C3D6DF", "blue"],
  ["Powder Blue", "ฟ้าผง", "#A8C3D4", "blue"],
  ["Cornflower", "ฟ้าคอร์นฟลาวเวอร์", "#7E9CC4", "blue"],
  ["Ocean Teal", "เขียวทะเล", "#5E8C97", "blue"],
  ["Denim Blue", "น้ำเงินเดนิม", "#4F6E92", "blue"],
  ["Navy Deep", "น้ำเงินเข้ม", "#2E3F5C", "blue"],
  // purple-pink
  ["Blush Pink", "ชมพูบลัช", "#EBC9CC", "purple"],
  ["Rose Quartz", "โรสควอตซ์", "#E2C2C6", "purple"],
  ["Lavender Haze", "ลาเวนเดอร์", "#C3B6D0", "purple"],
  ["Dusty Mauve", "ม่วงนวล", "#B393A0", "purple"],
  ["Plum Wine", "ไวน์พลัม", "#6E4A5E", "purple"],
  ["Grape", "องุ่น", "#5C4A6E", "purple"],
];

// --- per-brand config ----------------------------------------------------
const FAMILY_PREFIX = {
  neutral: "N",
  warm: "W",
  earth: "E",
  green: "G",
  blue: "B",
  purple: "P",
};

const BRANDS = [
  {
    slug: "toa",
    collectionEn: "TOA Color World",
    collectionTh: "TOA คัลเลอร์ เวิลด์",
    shift: 0,
    code: (i) => `TOA ${1000 + i * 11}`,
  },
  {
    slug: "captain",
    collectionEn: "Captain Color Inspiration",
    collectionTh: "กัปตัน คัลเลอร์ อินสไปเรชัน",
    shift: 1,
    code: (i, fam) => `${FAMILY_PREFIX[fam]}P${2100 + i * 7}`,
  },
  {
    slug: "jbp",
    collectionEn: "JBP Colour Selection",
    collectionTh: "JBP คัลเลอร์ ซีเล็คชัน",
    shift: 2,
    code: (i, fam) => `JBP-${FAMILY_PREFIX[fam]}${201 + i}`,
  },
  {
    slug: "nippon",
    collectionEn: "Nippon Colour Creations",
    collectionTh: "นิปปอน คัลเลอร์ ครีเอชันส์",
    shift: 3,
    code: (i, fam) => `NP ${FAMILY_PREFIX[fam]} ${1500 + i * 9}`,
  },
  {
    slug: "dulux",
    collectionEn: "Dulux Colour Palette",
    collectionTh: "ดูลักซ์ คัลเลอร์ พาเลตต์",
    shift: 4,
    code: (i) => `DLX ${30 + i}YY ${60 + i}/${120 + i * 4}`,
  },
  {
    slug: "qqq",
    collectionEn: "QQQ Colour Range",
    collectionTh: "QQQ คัลเลอร์ เรนจ์",
    shift: 5,
    code: (i) => `QQ-${300 + i * 5}`,
  },
];

// deterministic small hue/lightness jitter so each brand's tint differs
function jitter(hex, shift) {
  if (shift === 0) return hex.toUpperCase();
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const d = shift;
  r = Math.min(255, Math.max(0, r + d * 2 - 3));
  g = Math.min(255, Math.max(0, g - d + 2));
  b = Math.min(255, Math.max(0, b + d - 2));
  return (
    "#" +
    [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

mkdirSync(OUT_DIR, { recursive: true });

for (const brand of BRANDS) {
  const colors = BASE.map(([nameEn, nameTh, hex, family], i) => ({
    code: brand.code(i, family),
    nameEn,
    nameTh,
    hex: jitter(hex, brand.shift),
    family,
    sortOrder: i,
  }));

  const data = {
    brandSlug: brand.slug,
    collection: {
      slug: `${brand.slug}-colors`,
      nameEn: brand.collectionEn,
      nameTh: brand.collectionTh,
      description: `ชุดสีตัวอย่างของแบรนด์ ${brand.slug.toUpperCase()} (ข้อมูล hybrid — พร้อมแทนที่ด้วยชาร์ทสีทางการ)`,
    },
    colors,
  };

  writeFileSync(
    join(OUT_DIR, `${brand.slug}.json`),
    JSON.stringify(data, null, 2) + "\n",
  );
  console.log(`  ${brand.slug}.json — ${colors.length} colours`);
}

console.log("Colour charts generated.");
