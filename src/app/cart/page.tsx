"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import Icon from "@/components/Icon";

export default function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const total = cart.total();

  async function checkout() {
    setSubmitting(true);
    const res = await fetch("/api/orders/buynow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
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
    <main className="min-h-screen p-5 max-w-2xl mx-auto pb-44">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/buynow"
          className="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-soft active:scale-95"
        >
          <Icon name="back" size={22} />
        </Link>
        <div>
          <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
            Your Cart
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ตะกร้า 🛒</h1>
        </div>
      </header>

      {cart.items.length === 0 ? (
        <div className="card text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">🛒</div>
          <div className="font-semibold">ตะกร้าว่างเปล่า</div>
        </div>
      ) : (
        <div className="space-y-3">
          {cart.items.map((i) => (
            <div key={i.productId} className="card p-3 flex gap-3">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-red-200 rounded-xl flex-shrink-0 overflow-hidden">
                {i.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={i.imageUrl}
                    alt={i.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight">{i.name}</div>
                <div className="text-orange-700 font-extrabold mt-0.5">
                  ฿{i.price.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => cart.setQuantity(i.productId, i.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center"
                  >
                    <Icon name="minus" size={16} strokeWidth={3} />
                  </button>
                  <span className="w-8 text-center font-extrabold">{i.quantity}</span>
                  <button
                    onClick={() =>
                      cart.setQuantity(i.productId, Math.min(i.stock, i.quantity + 1))
                    }
                    className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center"
                  >
                    <Icon name="plus" size={16} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => cart.remove(i.productId)}
                    className="ml-auto text-red-600 text-sm font-semibold flex items-center gap-1"
                  >
                    <Icon name="trash" size={16} />
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-100 p-4 shadow-deep">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-stone-500 text-sm uppercase tracking-wider font-semibold">
                รวมทั้งหมด
              </span>
              <span className="text-3xl font-black text-orange-700">
                ฿{total.toLocaleString()}
              </span>
            </div>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="btn-primary w-full rounded-xl py-4 font-bold text-lg"
              >
                สั่งซื้อทั้งหมด
              </button>
            ) : (
              <div>
                <div className="text-center font-semibold mb-2">
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
                    onClick={checkout}
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
      )}
    </main>
  );
}
