"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import EnableNotifications from "./EnableNotifications";
import Icon from "@/components/Icon";

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
  const active = orders.filter((o) => o.status === "ACCEPTED" || o.status === "PAID");
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

  const list = tab === "INCOMING" ? incoming : tab === "ACTIVE" ? active : cancelled;

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <EnableNotifications />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <TabBtn
          active={tab === "INCOMING"}
          onClick={() => setTab("INCOMING")}
          label="ออเดอร์เข้า"
          count={incoming.length}
          accent
        />
        <TabBtn
          active={tab === "ACTIVE"}
          onClick={() => setTab("ACTIVE")}
          label="ออเดอร์สินค้า"
          count={active.length}
        />
        <TabBtn
          active={tab === "CANCELLED"}
          onClick={() => setTab("CANCELLED")}
          label="ยกเลิก"
          count={cancelled.length}
        />
      </div>

      <div className="card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-medium">
            — ไม่มีออเดอร์ —
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {list.map((o) => (
              <li key={o.id} className="p-4 flex items-start gap-3">
                <button
                  onClick={() => setViewing(o)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        o.type === "BUYNOW"
                          ? "bg-red-600 text-white"
                          : "bg-amber-400 text-stone-900"
                      }`}
                    >
                      {o.type === "BUYNOW" ? "ซื้อเลย" : "สั่งล่วงหน้า"}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">#{o.id}</span>
                    <span className="text-xs text-stone-400">
                      {new Date(o.createdAt).toLocaleString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    {o.status === "PAID" && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        จ่ายแล้ว
                      </span>
                    )}
                    {o.status === "ACCEPTED" && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        รอชำระ
                      </span>
                    )}
                    {o.status === "EXPIRED" && (
                      <span className="text-[10px] bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        หมดเวลา
                      </span>
                    )}
                  </div>
                  <div className="text-sm mt-1.5 truncate font-medium text-stone-700">
                    {o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {o.customerName || "—"}{" "}
                    {o.customerPhone && (
                      <span className="font-mono">· {o.customerPhone}</span>
                    )}
                  </div>
                  <div className="font-extrabold text-orange-700 text-lg mt-1">
                    ฿{o.totalPrice.toLocaleString()}
                  </div>
                </button>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {tab === "INCOMING" && (
                    <>
                      <button
                        onClick={() => accept(o.id)}
                        className="btn-primary text-xs font-bold px-3 py-2 rounded-lg"
                      >
                        รับ
                      </button>
                      <button
                        onClick={() => cancel(o.id)}
                        className="btn-ghost text-xs font-bold px-3 py-2 rounded-lg text-red-700"
                      >
                        ยกเลิก
                      </button>
                    </>
                  )}
                  {tab === "ACTIVE" &&
                    o.type === "BUYNOW" &&
                    o.status === "ACCEPTED" && (
                      <button
                        onClick={() => confirmPay(o.id)}
                        className="btn-primary text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                      >
                        <Icon name="wallet" size={14} />
                        รับเงิน
                      </button>
                    )}
                  {tab === "ACTIVE" && (
                    <button
                      onClick={() => del(o.id)}
                      className="btn-ghost text-xs font-bold px-3 py-2 rounded-lg text-stone-500"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                  {tab === "CANCELLED" && (
                    <button
                      onClick={() => del(o.id)}
                      className="btn-ghost text-xs font-bold px-3 py-2 rounded-lg text-stone-500"
                    >
                      <Icon name="trash" size={14} />
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
  label,
  count,
  active,
  onClick,
  accent,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
        active
          ? accent
            ? "btn-primary"
            : "btn-dark"
          : "bg-white text-stone-700 border border-stone-200 shadow-soft"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] rounded-full min-w-5 h-5 px-1.5 inline-flex items-center justify-center font-extrabold ${
            active
              ? "bg-white/25 text-white"
              : accent
              ? "bg-red-600 text-white"
              : "bg-stone-900 text-white"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0 print:backdrop-blur-none print:static">
      <div className="print-receipt bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-auto shadow-deep print:shadow-none print:rounded-none print:max-h-none print:max-w-full">
        <div className="p-5 border-b border-stone-100 flex items-start justify-between print:hidden">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-orange-700">
              {order.type === "BUYNOW" ? "Order Now" : "Pre-order"}
            </div>
            <div className="font-black text-xl tracking-tight">
              ออเดอร์ <span className="font-mono">#{order.id}</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => window.print()}
              className="btn-dark text-xs font-bold px-3 py-2 rounded-lg"
            >
              พิมพ์
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block p-4 text-center border-b border-stone-300">
          <div className="font-black text-2xl">บ้านขนมจีน</div>
          <div className="text-sm">ใบสั่งซื้อ #{order.id}</div>
          <div className="text-xs text-stone-600">
            {new Date(order.createdAt).toLocaleString("th-TH")}
          </div>
        </div>
        <div className="p-5 space-y-3">
          <Field label="ชื่อ">{order.customerName || "—"}</Field>
          <Field label="เบอร์">{order.customerPhone || "—"}</Field>
          {order.type === "PREORDER" && (
            <>
              <Field label="รับสินค้า">
                {order.deliveryType === "PICKUP"
                  ? "🏠 รับเอง"
                  : order.deliveryType === "DELIVERY"
                  ? "🛵 ส่งถึงที่"
                  : "—"}
              </Field>
              <Field label="วันนัด">{order.pickupDateText || "—"}</Field>
              <Field label="รายละเอียด">
                <div className="whitespace-pre-wrap">
                  {order.deliveryDetail || "—"}
                </div>
              </Field>
            </>
          )}
          <div>
            <div className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold mb-1.5">
              รายการ
            </div>
            <ul className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 space-y-1.5">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>
                    {i.productName} <span className="text-stone-400">×{i.quantity}</span>
                  </span>
                  <span className="font-semibold">
                    ฿{(i.priceAtOrder * i.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
              <li className="flex justify-between border-t border-amber-200 pt-2 font-extrabold text-orange-700">
                <span>รวม</span>
                <span>฿{order.totalPrice.toLocaleString()}</span>
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
      <div className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold">
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
