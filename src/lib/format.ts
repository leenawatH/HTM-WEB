import { PRICING } from "@/lib/constants";

// THB currency formatting — used across product cards, cart, checkout.
const thb = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number): string {
  return `${PRICING.currencySymbol}${thb.format(amount)}`;
}

// Final unit price after a percentage discount.
export function discountedPrice(basePrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return basePrice;
  return Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
}
