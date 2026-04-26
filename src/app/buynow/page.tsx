"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

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
    <main className="min-h-screen p-4 max-w-3xl mx-auto pb-24">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link href="/" className="text-orange-600 text-2xl mr-2">
            ←
          </Link>
          <h1 className="text-2xl font-bold text-orange-700">🛒 ซื้อเลย!</h1>
        </div>
        <Link
          href="/cart"
          className="relative bg-orange-600 text-white p-3 rounded-full"
        >
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
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
              className={`bg-white rounded-2xl shadow p-3 text-left transition relative ${
                out ? "opacity-40 grayscale" : "active:scale-95"
              }`}
            >
              <div className="aspect-square bg-orange-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🍜</span>
                )}
              </div>
              <div className="font-semibold text-stone-800 text-sm leading-tight">
                {p.name}
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-orange-600 font-bold">{p.price}฿</div>
                <div className="text-xs text-stone-500">เหลือ {p.stock}</div>
              </div>
              {out && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
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
    // include cart items + this product
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
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-2">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-4 border-b">
          <div className="font-bold text-lg">{product.name}</div>
          <div className="text-orange-600 font-bold">{product.price}฿ / ชิ้น</div>
          <div className="text-xs text-stone-500">สต็อก: {product.stock}</div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-semibold">จำนวน</label>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-12 h-12 rounded-xl border-2 border-stone-200 text-2xl font-bold"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) =>
                  setQty(Math.min(product.stock, Math.max(1, Number(e.target.value))))
                }
                className="flex-1 border-2 border-stone-200 rounded-xl p-3 text-center text-xl font-bold"
              />
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="w-12 h-12 rounded-xl border-2 border-stone-200 text-2xl font-bold"
              >
                +
              </button>
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <div className="text-stone-600 text-sm">ราคารวม</div>
            <div className="text-2xl font-bold text-orange-600">
              {total.toLocaleString()}฿
            </div>
          </div>
        </div>

        {!confirming ? (
          <div className="p-4 border-t grid grid-cols-3 gap-2">
            <button
              onClick={onClose}
              className="border-2 border-stone-300 rounded-xl py-3 font-semibold text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={addToCart}
              className="bg-amber-500 text-white rounded-xl py-3 font-bold text-sm"
            >
              + ตะกร้า
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="bg-orange-600 text-white rounded-xl py-3 font-bold text-sm"
            >
              ซื้อเลย!
            </button>
          </div>
        ) : (
          <div className="p-4 border-t">
            <div className="text-center mb-3 font-semibold">
              ยืนยันการสั่งซื้อใช่ไหม?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="border-2 border-stone-300 rounded-xl py-3 font-semibold"
              >
                ไม่
              </button>
              <button
                onClick={buyNow}
                disabled={submitting}
                className="bg-orange-600 text-white rounded-xl py-3 font-bold disabled:opacity-50"
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
