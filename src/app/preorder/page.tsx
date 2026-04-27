"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePreorderCart } from "@/lib/preorderCart";
import Icon from "@/components/Icon";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export default function PreOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const cartCount = usePreorderCart((s) => s.count());

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  return (
    <main className="min-h-screen p-5 max-w-3xl mx-auto pb-24">
      <header className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-soft active:scale-95"
          >
            <Icon name="back" size={22} />
          </Link>
          <div>
            <div className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Pre-order
            </div>
            <h1 className="text-2xl font-bold tracking-tight">สั่งล่วงหน้า</h1>
          </div>
        </div>
        <Link
          href="/preorder/cart"
          className="relative bg-white border-2 border-stone-900 rounded-2xl w-12 h-12 flex items-center justify-center text-2xl shadow-soft active:scale-95"
        >
          <span>🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center font-extrabold ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="card p-3 text-left active:scale-[0.97] transition"
          >
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl mb-3 overflow-hidden border border-amber-100">
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2 min-h-[2.5em]">
              {p.name}
            </div>
            <div className="mt-1 text-orange-700 font-extrabold text-lg">
              ฿{p.price.toLocaleString()}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <PreOrderModal product={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

function PreOrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const cart = usePreorderCart();

  const total = product.price * qty;

  function addToCart(redirect: boolean) {
    cart.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: qty,
    });
    onClose();
    if (redirect) {
      // redirect handled by Link below; this branch unused but kept for clarity
    }
  }

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-2">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-deep">
        <div className="p-5 border-b border-stone-100 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Pre-order
            </div>
            <div className="font-bold text-lg leading-tight">{product.name}</div>
            <div className="text-orange-700 font-extrabold text-xl mt-1">
              ฿{product.price}{" "}
              <span className="text-xs font-medium text-stone-500">/ ชิ้น</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="label">จำนวน</div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-12 h-12 rounded-xl bg-white border-2 border-stone-200 flex items-center justify-center active:scale-95"
              >
                <Icon name="minus" size={20} strokeWidth={3} />
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="field flex-1 text-center text-xl font-extrabold"
              />
              <button
                onClick={() => setQty(qty + 1)}
                className="w-12 h-12 rounded-xl bg-white border-2 border-stone-200 flex items-center justify-center active:scale-95"
              >
                <Icon name="plus" size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
          <div className="rounded-2xl p-4 text-center bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 border border-amber-200">
            <div className="text-stone-600 text-xs font-semibold tracking-wider uppercase">
              ราคารวม
            </div>
            <div className="text-3xl font-black text-orange-700 mt-1">
              ฿{total.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-100 grid grid-cols-3 gap-2">
          <button
            onClick={onClose}
            className="btn-ghost rounded-xl py-3 font-semibold text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => addToCart(false)}
            className="btn-amber rounded-xl py-3 font-bold text-sm"
          >
            + ตะกร้า
          </button>
          <Link
            href="/preorder/cart"
            onClick={() => {
              cart.add({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: qty,
              });
            }}
            className="btn-primary rounded-xl py-3 font-bold text-sm flex items-center justify-center"
          >
            สั่งเลย
          </Link>
        </div>
      </div>
    </div>
  );
}
