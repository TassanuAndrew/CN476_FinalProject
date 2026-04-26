"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";

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
    <main className="min-h-screen p-4 max-w-2xl mx-auto pb-32">
      <header className="flex items-center mb-4">
        <Link href="/buynow" className="text-orange-600 text-2xl mr-2">
          ←
        </Link>
        <h1 className="text-2xl font-bold text-orange-700">🛒 ตะกร้า</h1>
      </header>

      {cart.items.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <div className="text-5xl mb-3">🛒</div>
          ตะกร้าว่างเปล่า
        </div>
      ) : (
        <div className="space-y-3">
          {cart.items.map((i) => (
            <div key={i.productId} className="bg-white rounded-2xl p-3 flex gap-3 shadow">
              <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {i.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🍜</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{i.name}</div>
                <div className="text-orange-600 font-bold">{i.price}฿</div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => cart.setQuantity(i.productId, i.quantity - 1)}
                    className="w-8 h-8 rounded-lg border-2 border-stone-200 font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold">{i.quantity}</span>
                  <button
                    onClick={() =>
                      cart.setQuantity(i.productId, Math.min(i.stock, i.quantity + 1))
                    }
                    className="w-8 h-8 rounded-lg border-2 border-stone-200 font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => cart.remove(i.productId)}
                    className="ml-auto text-red-500 text-sm"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-2xl">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-stone-600">รวมทั้งหมด</span>
              <span className="text-2xl font-bold text-orange-600">
                {total.toLocaleString()}฿
              </span>
            </div>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold text-lg"
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
                    className="border-2 border-stone-300 rounded-xl py-3 font-semibold"
                  >
                    ไม่
                  </button>
                  <button
                    onClick={checkout}
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
      )}
    </main>
  );
}
