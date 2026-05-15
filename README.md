# Hor Tong Mong (HTM-WEB)

ร้านอีคอมเมิร์ซขายสีทาบ้านและเครื่องมือช่างครบวงจร พร้อมฟีเจอร์เด่น —
**ทดลองสีบนผนังจริงผ่านกล้อง** ก่อนตัดสินใจซื้อ

A modern e-commerce platform for paint & hardware tools, featuring a live
camera **colour test** that lets customers preview paint colours on real walls.

---

## Tech stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| Framework    | Next.js 16 (App Router) + TypeScript                  |
| Styling      | Tailwind CSS v4 + shadcn/ui (Base UI)                 |
| Database     | PostgreSQL (Supabase) + Prisma 7                      |
| Auth         | Auth.js v5 — email/password + Google OAuth            |
| Cart state   | Zustand (persisted to localStorage)                   |
| i18n         | next-intl — Thai (default) + English                  |
| Colour test  | Canvas colour-region heuristic + MediaPipe (optional) |
| Payments     | Stripe / PromptPay — stubbed, ready for real keys     |

## Prerequisites

- **Node.js ≥ 20.19** (Next.js 16 requirement)
- A **Supabase** project (free tier is fine) for the PostgreSQL database

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example file and fill in the values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — Supabase **Session pooler** connection string
     (Dashboard → Settings → Database → Connection string)
   - `AUTH_SECRET` — generate with:
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — optional, enables Google sign-in
   - `STRIPE_*` — optional, payment integration is stubbed until provided

3. **Set up the database**

   ```bash
   npx prisma generate     # generate the Prisma client
   npm run db:push         # apply the schema to your database
   npm run db:seed         # seed brands, categories, 24 products, colours
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

   Demo accounts (created by the seed):
   - Customer — `demo@hortongmong.co.th` / `demo1234`
   - Admin — `admin@hortongmong.co.th` / `demo1234`

## Available scripts

| Script                | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Start the development server                     |
| `npm run build`       | Production build                                 |
| `npm run db:seed`     | Seed the database with sample data               |
| `npm run db:push`     | Sync the Prisma schema to the database           |
| `npm run db:studio`   | Open Prisma Studio                               |
| `npm run gen:colors`  | Regenerate brand colour-chart JSON               |
| `npm run gen:images`  | Regenerate placeholder SVG images                |

## Features

- **Home** — promo carousel, recommended products, categories, partner brands
- **Catalogue** — category listing with brand/price filters, sort, pagination
- **Product** — image gallery, size/colour selection, tabs, related products
- **🎨 Colour test** — camera or photo upload, tap a wall to recolour it live
- **Cart & checkout** — guest checkout, vouchers, 4 payment methods
- **Accounts** — orders + reorder, addresses, vouchers, wishlist
- Thai/English i18n, mobile-first responsive design

## Project structure

```
prisma/          schema, seed script, colour data + generators
src/
  app/           routes (App Router)
  actions/       server actions (cart, orders, auth, account)
  components/    UI — layout, product, cart, checkout, account, color-test
  lib/           data access, pricing, colour-test processing, constants
  store/         Zustand cart store
  i18n/          next-intl config
messages/        th.json / en.json
public/          brand, category and product images
```

## Notes

- **Colour charts** are hybrid sample data (generated, brand-styled). Replace
  the JSON in `prisma/data/colors/` with official decks and re-seed.
- **Payments** are stubbed — orders are recorded as "pending". Add real
  Stripe/PromptPay credentials to enable live payment.
- **Images** are generated SVG placeholders, ready to swap for Cloudinary/S3.
- The colour test's MediaPipe person-segmentation is optional and degrades
  gracefully to the colour-region heuristic if it fails to load.
