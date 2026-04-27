"use client";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";

interface OrderItem {
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

interface Order {
  id: number;
  type: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  customerName: string | null;
  deliveryType: string | null;
  pickupDateText: string | null;
  items: OrderItem[];
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "รอแอดมินรับ", cls: "bg-amber-100 text-amber-800" },
  ACCEPTED: { text: "รอชำระเงิน", cls: "bg-blue-100 text-blue-800" },
  PAID: { text: "ชำระเงินแล้ว", cls: "bg-green-100 text-green-800" },
  CANCELLED: { text: "ยกเลิก", cls: "bg-stone-200 text-stone-700" },
  EXPIRED: { text: "หมดเวลา", cls: "bg-stone-200 text-stone-700" },
};

const TYPE_LABEL: Record<string, string> = {
  BUYNOW: "ซื้อเลย!",
  PREORDER: "สั่งล่วงหน้า",
};

export default function HistoryPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError("กรุณากรอกเบอร์");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/orders/history?phone=${encodeURIComponent(phone.trim())}`);
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        setOrders(null);
        return;
      }
      setOrders(data);
    } catch {
      setError("เชื่อมต่อไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center"
        >
          <Icon name="back" size={18} />
        </Link>
        <div>
          <div className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            History
          </div>
          <h1 className="text-2xl font-black tracking-tight">ประวัติการสั่งซื้อ</h1>
        </div>
      </div>

      <form onSubmit={search} className="card p-4 mb-4">
        <div className="label mb-1">เบอร์โทรที่ใช้สั่ง</div>
        <div className="flex gap-2">
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08x-xxx-xxxx"
            className="field flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-5 rounded-xl font-bold disabled:opacity-60"
          >
            {loading ? "..." : "ค้นหา"}
          </button>
        </div>
        {error && (
          <div className="text-sm text-red-700 mt-2 font-semibold">{error}</div>
        )}
      </form>

      {orders !== null && orders.length === 0 && (
        <div className="card p-8 text-center text-stone-500">
          ไม่พบรายการสำหรับเบอร์นี้
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => {
            const st = STATUS_LABEL[o.status] || {
              text: o.status,
              cls: "bg-stone-200",
            };
            const date = new Date(o.createdAt);
            const dateStr = date.toLocaleString("th-TH", {
              dateStyle: "medium",
              timeStyle: "short",
            });
            return (
              <div key={o.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs text-stone-500">{dateStr}</div>
                    <div className="font-bold">
                      #{o.id} • {TYPE_LABEL[o.type] || o.type}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}
                  >
                    {st.text}
                  </span>
                </div>
                <div className="space-y-1 text-sm border-t border-stone-100 pt-2">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-stone-700">
                        {it.productName} ×{it.quantity}
                      </span>
                      <span className="text-stone-500">
                        ฿{(it.priceAtOrder * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-100 mt-2 pt-2 flex justify-between items-center">
                  <span className="text-sm text-stone-500">รวม</span>
                  <span className="font-extrabold text-orange-700 text-lg">
                    ฿{o.totalPrice.toLocaleString()}
                  </span>
                </div>
                {o.type === "BUYNOW" && o.status === "ACCEPTED" && (
                  <Link
                    href={`/order/${o.id}/payment`}
                    className="btn-primary w-full text-center rounded-xl py-2.5 font-bold mt-3 block"
                  >
                    ชำระเงิน
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
