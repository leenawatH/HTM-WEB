"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Cart lives in localStorage for guests; merged into the DB Cart on login (Phase 5).
export type CartItem = {
  // unique line key — same variant + same colour collapse into one line
  key: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  brandName: string;
  variantLabel: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  colorId?: string;
  colorCode?: string;
  colorName?: string;
  colorHex?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

function lineKey(variantId: string, colorId?: string) {
  return colorId ? `${variantId}:${colorId}` : variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const key = lineKey(item.variantId, item.colorId);
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, i.maxStock),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, key, quantity: Math.min(quantity, item.maxStock) },
            ],
          };
        });
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.flatMap((i) => {
            if (i.key !== key) return [i];
            if (quantity <= 0) return [];
            return [{ ...i, quantity: Math.min(quantity, i.maxStock) }];
          }),
        })),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: "htm-cart" },
  ),
);
