// Generates SVG placeholder images into /public — brand logos, category
// banners and product images. Run: npx tsx prisma/data/generate-images.ts
// Replace these with real photography / Cloudinary assets later.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BRAND_SEED,
  CATEGORY_SEED,
  CATEGORY_TINT,
  PRODUCT_SEED,
} from "./catalog";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, "..", "..", "public");

const NAVY = "#16284F";
const ORANGE = "#F97316";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (n & 255) + amount));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// --- brand logos ---------------------------------------------------------
function brandLogo(name: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" fill="#ffffff"/>
  <rect x="8" y="8" width="304" height="144" rx="12" fill="none" stroke="#E2E8F0" stroke-width="2"/>
  <circle cx="60" cy="80" r="26" fill="${ORANGE}"/>
  <text x="170" y="92" font-family="Kanit, Segoe UI, sans-serif" font-size="34" font-weight="700" fill="${NAVY}" text-anchor="middle">${esc(name)}</text>
</svg>
`;
}

// --- category banners ----------------------------------------------------
function categoryBanner(nameTh: string, nameEn: string, tint: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(tint, 30)}"/>
      <stop offset="1" stop-color="${shade(tint, -40)}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#g)"/>
  <circle cx="660" cy="120" r="140" fill="#ffffff" opacity="0.08"/>
  <circle cx="120" cy="400" r="110" fill="#ffffff" opacity="0.08"/>
  <text x="60" y="250" font-family="Kanit, Segoe UI, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${esc(nameTh)}</text>
  <text x="62" y="300" font-family="Segoe UI, sans-serif" font-size="28" fill="#ffffff" opacity="0.8">${esc(nameEn)}</text>
</svg>
`;
}

// --- product images ------------------------------------------------------
function productImage(
  brand: string,
  categoryTh: string,
  tint: string,
  variant: number,
) {
  const a = variant === 0 ? shade(tint, 38) : shade(tint, -10);
  const b = variant === 0 ? shade(tint, -36) : shade(tint, -64);
  // a simple paint-can / box motif
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="300" cy="270" r="190" fill="#ffffff" opacity="0.1"/>
  <g transform="translate(210 175)">
    <rect x="0" y="40" width="180" height="200" rx="10" fill="#ffffff" opacity="0.92"/>
    <rect x="0" y="40" width="180" height="44" rx="10" fill="${ORANGE}"/>
    <rect x="44" y="14" width="92" height="34" rx="8" fill="#ffffff" opacity="0.92"/>
    <circle cx="90" cy="160" r="40" fill="${shade(tint, -10)}"/>
  </g>
  <text x="300" y="470" font-family="Kanit, Segoe UI, sans-serif" font-size="46" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(brand)}</text>
  <text x="300" y="514" font-family="Segoe UI, sans-serif" font-size="26" fill="#ffffff" opacity="0.85" text-anchor="middle">${esc(categoryTh)}</text>
</svg>
`;
}

// --- write everything ----------------------------------------------------
for (const dir of ["brands", "categories", "products"]) {
  mkdirSync(join(PUBLIC, dir), { recursive: true });
}

for (const b of BRAND_SEED) {
  writeFileSync(join(PUBLIC, "brands", `${b.slug}.svg`), brandLogo(b.name));
}
console.log(`brands: ${BRAND_SEED.length} logos`);

for (const c of CATEGORY_SEED) {
  writeFileSync(
    join(PUBLIC, "categories", `${c.slug}.svg`),
    categoryBanner(c.nameTh, c.nameEn, CATEGORY_TINT[c.slug] ?? NAVY),
  );
}
console.log(`categories: ${CATEGORY_SEED.length} banners`);

let productCount = 0;
for (const p of PRODUCT_SEED) {
  const brand = BRAND_SEED.find((b) => b.slug === p.brandSlug)?.name ?? "";
  const cat = CATEGORY_SEED.find((c) => c.slug === p.categorySlug);
  const tint = CATEGORY_TINT[p.categorySlug] ?? NAVY;
  writeFileSync(
    join(PUBLIC, "products", `${p.slug}.svg`),
    productImage(brand, cat?.nameTh ?? "", tint, 0),
  );
  writeFileSync(
    join(PUBLIC, "products", `${p.slug}-2.svg`),
    productImage(brand, cat?.nameTh ?? "", tint, 1),
  );
  productCount += 2;
}
console.log(`products: ${productCount} images`);
console.log("Placeholder images generated.");
