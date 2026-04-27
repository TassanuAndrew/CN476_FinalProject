"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import Icon from "@/components/Icon";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export default function BuyNowPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const cartCount = useCart((s) => s.count());

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
            <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
              Order Now
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ซื้อเลย</h1>
          </div>
        </div>
        <Link
          href="/cart"
          className="relative btn-dark rounded-2xl w-12 h-12 flex items-center justify-center text-2xl"
        >
          <span>🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-stone-900 text-xs rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center font-extrabold ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => {
          const out = p.stock <= 0;
          return (
            <button
              key={p.id}
              disabled={out}
              onClick={() => setSelected(p)}
              className={`card p-3 text-left transition relative ${
                out ? "opacity-50 grayscale" : "active:scale-[0.97]"
              }`}
            >
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-red-200 rounded-2xl mb-3 overflow-hidden border border-amber-100">
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
              <div className="flex justify-between items-end mt-1">
                <div className="text-orange-700 font-extrabold text-lg leading-none">
                  ฿{p.price.toLocaleString()}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  เหลือ {p.stock}
                </div>
              </div>
              {out && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-stone-900 text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                    หมด
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && <BuyModal product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function BuyModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const cart = useCart();

  const total = product.price * qty;

  function addToCart() {
    cart.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      quantity: qty,
    });
    onClose();
  }

  async function buyNow() {
    setSubmitting(true);
    const cartItems = cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
    const existing = cartItems.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      cartItems.push({ productId: product.id, quantity: qty });
    }
    const res = await fetch("/api/orders/buynow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems }),
    });
    if (res.ok) {
      const order = await res.json();
      cart.clear();
      router.push(`/order/${order.id}/waiting`);
    } else {
      alert((await res.json()).error || "เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-2">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-deep">
        <div className="p-5 border-b border-stone-100 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
              Order Now
            </div>
            <div className="font-bold text-lg leading-tight">{product.name}</div>
            <div className="text-orange-700 font-extrabold text-xl mt-1">
              ฿{product.price}{" "}
              <span className="text-xs font-medium text-stone-500">/ ชิ้น · สต็อก {product.stock}</span>
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
                max={product.stock}
                value={qty}
                onChange={(e) =>
                  setQty(Math.min(product.stock, Math.max(1, Number(e.target.value))))
                }
                className="field flex-1 text-center text-xl font-extrabold"
              />
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="w-12 h-12 rounded-xl bg-white border-2 border-stone-200 flex items-center justify-center active:scale-95"
              >
                <Icon name="plus" size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
          <div className="rounded-2xl p-4 text-center bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 border border-amber-200">
            <div className="text-stone-600 text-xs font-semibold tracking-wider uppercase">
              ราคารวม
            </div>
            <div className="text-3xl font-black text-orange-700 mt-1">
              ฿{total.toLocaleString()}
            </div>
          </div>
        </div>

        {!confirming ? (
          <div className="p-4 border-t border-stone-100 grid grid-cols-3 gap-2">
            <button
              onClick={onClose}
              className="btn-ghost rounded-xl py-3 font-semibold text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={addToCart}
              className="btn-amber rounded-xl py-3 font-bold text-sm"
            >
              + ตะกร้า
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="btn-primary rounded-xl py-3 font-bold text-sm"
            >
              ซื้อเลย
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-stone-100">
            <div className="text-center mb-3 font-semibold">
              ยืนยันการสั่งซื้อใช่ไหม?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="btn-ghost rounded-xl py-3 font-semibold"
              >
                ไม่
              </button>
              <button
                onClick={buyNow}
                disabled={submitting}
                className="btn-primary rounded-xl py-3 font-bold disabled:opacity-50"
              >
                {submitting ? "กำลังส่ง..." : "ใช่"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
