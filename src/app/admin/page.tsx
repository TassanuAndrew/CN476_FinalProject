"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import EnableNotifications from "./EnableNotifications";

function playDing() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const t = now + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.45);
    });
  } catch {}
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

interface Order {
  id: number;
  type: "PREORDER" | "BUYNOW";
  status: "PENDING" | "ACCEPTED" | "PAID" | "CANCELLED" | "EXPIRED";
  customerName: string | null;
  customerPhone: string | null;
  deliveryType: string | null;
  deliveryDetail: string | null;
  pickupDateText: string | null;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"INCOMING" | "ACTIVE" | "CANCELLED">("INCOMING");
  const [viewing, setViewing] = useState<Order | null>(null);
  const prevPendingIds = useRef<Set<number>>(new Set());
  const initialized = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (!res.ok) return;
    const data: Order[] = await res.json();

    // detect new pending orders → ding
    const newPending = data.filter((o) => o.status === "PENDING");
    const currentIds = new Set(newPending.map((o) => o.id));
    const isNew = [...currentIds].some((id) => !prevPendingIds.current.has(id));
    if (isNew && initialized.current) playDing();
    prevPendingIds.current = currentIds;
    initialized.current = true;

    setOrders(data);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const incoming = orders.filter((o) => o.status === "PENDING");
  const active = orders.filter(
    (o) => o.status === "ACCEPTED" || o.status === "PAID"
  );
  const cancelled = orders.filter(
    (o) => o.status === "CANCELLED" || o.status === "EXPIRED"
  );

  async function accept(id: number) {
    const res = await fetch(`/api/admin/orders/${id}/accept`, { method: "POST" });
    if (!res.ok) alert((await res.json()).error);
    load();
  }
  async function cancel(id: number) {
    if (!confirm("ยกเลิกออเดอร์นี้?")) return;
    await fetch(`/api/admin/orders/${id}/cancel`, { method: "POST" });
    load();
  }
  async function confirmPay(id: number) {
    if (!confirm("ยืนยันว่าได้รับเงินแล้ว?")) return;
    await fetch(`/api/admin/orders/${id}/confirm-payment`, { method: "POST" });
    load();
  }
  async function del(id: number) {
    if (!confirm("ลบออเดอร์นี้?")) return;
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    load();
  }

  const list =
    tab === "INCOMING" ? incoming : tab === "ACTIVE" ? active : cancelled;

  return (
    <main className="p-3 max-w-5xl mx-auto">
      <EnableNotifications />

      <div className="grid grid-cols-3 gap-2 mb-3">
        <TabBtn active={tab === "INCOMING"} onClick={() => setTab("INCOMING")}>
          🔔 ออเดอร์เข้า
          {incoming.length > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">
              {incoming.length}
            </span>
          )}
        </TabBtn>
        <TabBtn active={tab === "ACTIVE"} onClick={() => setTab("ACTIVE")}>
          📦 ออเดอร์สินค้า
        </TabBtn>
        <TabBtn active={tab === "CANCELLED"} onClick={() => setTab("CANCELLED")}>
          ❌ ยกเลิก
        </TabBtn>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center text-stone-400">- ไม่มีออเดอร์ -</div>
        ) : (
          <ul className="divide-y">
            {list.map((o) => (
              <li key={o.id} className="p-3 flex items-start gap-3">
                <button
                  onClick={() => setViewing(o)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        o.type === "BUYNOW"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {o.type === "BUYNOW" ? "ซื้อเลย!" : "สั่งล่วงหน้า"}
                    </span>
                    <span className="text-xs text-stone-500">#{o.id}</span>
                    <span className="text-xs text-stone-500">
                      {new Date(o.createdAt).toLocaleString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    {o.status === "PAID" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                        ✅ จ่ายแล้ว
                      </span>
                    )}
                    {o.status === "ACCEPTED" && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                        รอชำระ
                      </span>
                    )}
                    {o.status === "EXPIRED" && (
                      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                        หมดเวลา
                      </span>
                    )}
                  </div>
                  <div className="text-sm mt-1 truncate">
                    {o.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                  </div>
                  <div className="text-xs text-stone-500">
                    {o.customerName || "-"} {o.customerPhone || ""}
                  </div>
                  <div className="font-bold text-orange-600 mt-1">
                    {o.totalPrice.toLocaleString()}฿
                  </div>
                </button>

                <div className="flex flex-col gap-1 flex-shrink-0">
                  {tab === "INCOMING" && (
                    <>
                      <button
                        onClick={() => accept(o.id)}
                        className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg"
                      >
                        รับ
                      </button>
                      <button
                        onClick={() => cancel(o.id)}
                        className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
                      >
                        ยกเลิก
                      </button>
                    </>
                  )}
                  {tab === "ACTIVE" && o.type === "BUYNOW" && o.status === "ACCEPTED" && (
                    <button
                      onClick={() => confirmPay(o.id)}
                      className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      💰 รับเงิน
                    </button>
                  )}
                  {tab === "ACTIVE" && (
                    <button
                      onClick={() => del(o.id)}
                      className="bg-stone-200 text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      ลบ
                    </button>
                  )}
                  {tab === "CANCELLED" && (
                    <button
                      onClick={() => del(o.id)}
                      className="bg-stone-200 text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      ลบ
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewing && (
        <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />
      )}
    </main>
  );
}

function TabBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-xl font-bold text-sm ${
        active ? "bg-orange-600 text-white" : "bg-white text-stone-700"
      }`}
    >
      {children}
    </button>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-bold">ออเดอร์ #{order.id}</div>
            <div className="text-sm text-stone-500">
              {order.type === "BUYNOW" ? "🛒 ซื้อเลย!" : "📦 สั่งล่วงหน้า"}
            </div>
          </div>
          <button onClick={onClose} className="text-2xl text-stone-500 px-2">
            ×
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Field label="ชื่อ">{order.customerName || "-"}</Field>
          <Field label="เบอร์">{order.customerPhone || "-"}</Field>
          {order.type === "PREORDER" && (
            <>
              <Field label="รับสินค้า">
                {order.deliveryType === "PICKUP"
                  ? "🏠 รับเอง"
                  : order.deliveryType === "DELIVERY"
                  ? "🛵 ส่งถึงที่"
                  : "-"}
              </Field>
              <Field label="วันนัด">{order.pickupDateText || "-"}</Field>
              <Field label="รายละเอียด">
                <div className="whitespace-pre-wrap">{order.deliveryDetail || "-"}</div>
              </Field>
            </>
          )}
          <div>
            <div className="text-xs text-stone-500 font-semibold mb-1">รายการ</div>
            <ul className="bg-orange-50 rounded-xl p-3 space-y-1">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>
                    {i.productName} × {i.quantity}
                  </span>
                  <span className="font-semibold">
                    {(i.priceAtOrder * i.quantity).toLocaleString()}฿
                  </span>
                </li>
              ))}
              <li className="flex justify-between border-t pt-1 font-bold text-orange-700">
                <span>รวม</span>
                <span>{order.totalPrice.toLocaleString()}฿</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-stone-500 font-semibold">{label}</div>
      <div>{children}</div>
    </div>
  );
}
