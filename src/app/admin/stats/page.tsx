"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

interface Stats {
  today: { revenue: number; orders: number };
  month: { revenue: number; orders: number };
  pending: number;
  accepted: number;
  topItems: { name: string; qty: number }[];
}

export default function AdminStats() {
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/stats", { cache: "no-store" });
      if (r.ok) setS(await r.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
            Dashboard
          </div>
          <h1 className="text-2xl font-black tracking-tight">สถิติยอดขาย</h1>
        </div>
        <button
          onClick={load}
          className="btn-ghost px-3 py-2 rounded-xl text-sm font-bold"
        >
          รีเฟรช
        </button>
      </div>

      {loading && !s && (
        <div className="card p-8 text-center text-stone-400">กำลังโหลด...</div>
      )}

      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                วันนี้
              </div>
              <div className="text-3xl font-black text-orange-700 mt-1">
                ฿{s.today.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-stone-500 mt-1">
                {s.today.orders} ออเดอร์
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                เดือนนี้
              </div>
              <div className="text-3xl font-black text-stone-900 mt-1">
                ฿{s.month.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-stone-500 mt-1">
                {s.month.orders} ออเดอร์
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Icon name="clock" size={22} />
              </div>
              <div>
                <div className="text-2xl font-black">{s.pending}</div>
                <div className="text-xs text-stone-500 font-semibold">
                  รอแอดมินรับ
                </div>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Icon name="wallet" size={22} />
              </div>
              <div>
                <div className="text-2xl font-black">{s.accepted}</div>
                <div className="text-xs text-stone-500 font-semibold">
                  รอชำระเงิน
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              เมนูขายดี (เดือนนี้)
            </div>
            {s.topItems.length === 0 ? (
              <div className="text-sm text-stone-400 py-4 text-center">
                ยังไม่มีข้อมูล
              </div>
            ) : (
              <div className="space-y-2">
                {s.topItems.map((it, i) => {
                  const max = s.topItems[0].qty;
                  const pct = max > 0 ? (it.qty / max) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">
                          {i + 1}. {it.name}
                        </span>
                        <span className="text-stone-500">{it.qty} ชิ้น</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
