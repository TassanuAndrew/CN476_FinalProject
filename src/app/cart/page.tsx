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
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const total = cart.total();

  async function checkout() {
    setSubmitting(true);
    const res = await fetch("/api/orders/buynow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
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
          <Link
            href="/buynow"
            className="inline-block mt-4 btn-primary px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            เลือกสินค้า
          </Link>
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
        <div className="card p-5 mt-4 space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold">
            ข้อมูลผู้สั่ง <span className="text-stone-400 font-normal normal-case tracking-normal">(ไม่บังคับ)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="label">ชื่อ</div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="field mt-1.5"
              />
            </div>
            <div>
              <div className="label">เบอร์ติดต่อ</div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="field mt-1.5"
              />
            </div>
          </div>
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
                <div className="text-center font-bold text-base mb-2">
                  ยืนยันการสั่งซื้อใช่ไหม?
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3 mb-3 text-sm">
                  <div className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold mb-1.5">
                    รายการทั้งหมด
                  </div>
                  <ul className="space-y-1">
                    {cart.items.map((i) => (
                      <li key={i.productId} className="flex justify-between">
                        <span className="truncate pr-2">
                          {i.name}{" "}
                          <span className="text-stone-400">×{i.quantity}</span>
                        </span>
                        <span className="font-semibold whitespace-nowrap">
                          ฿{(i.price * i.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                    <li className="flex justify-between border-t border-amber-200 pt-1.5 mt-1.5 font-extrabold text-orange-700 text-base">
                      <span>รวม</span>
                      <span>฿{total.toLocaleString()}</span>
                    </li>
                  </ul>
                  {(customerName.trim() || customerPhone.trim()) && (
                    <div className="border-t border-amber-200 mt-2 pt-2 text-xs text-stone-700">
                      <span className="text-stone-500">ติดต่อ:</span>{" "}
                      <span className="font-semibold">
                        {[customerName.trim(), customerPhone.trim()]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  )}
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
