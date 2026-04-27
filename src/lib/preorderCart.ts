"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PreorderCartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

interface PreorderCartState {
  items: PreorderCartItem[];
  add: (item: PreorderCartItem) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const usePreorderCart = create<PreorderCartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const found = s.items.find((i) => i.productId === item.productId);
          if (found) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "kanomjeen-preorder-cart" }
  )
);
