"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
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
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.stock) }
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
    { name: "kanomjeen-cart" }
  )
);
