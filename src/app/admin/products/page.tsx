"use client";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  active: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  async function load() {
    const r = await fetch("/api/admin/products");
    if (r.ok) setProducts(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      load();
    } else alert((await res.json()).error || "error");
  }

  async function del(id: number) {
    if (!confirm("ลบสินค้านี้?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  async function quickStock(p: Product, delta: number) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: Math.max(0, p.stock + delta) }),
    });
    load();
  }

  return (
    <main className="p-3 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">จัดการสินค้า</h1>
        <button
          onClick={() =>
            setEditing({ name: "", price: 0, stock: 0, imageUrl: "", active: true })
          }
          className="bg-orange-600 text-white px-3 py-2 rounded-lg font-bold text-sm"
        >
          + เพิ่มสินค้า
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow divide-y">
        {products.map((p) => (
          <div key={p.id} className="p-3 flex items-center gap-3">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🍜</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-sm text-orange-600 font-bold">{p.price}฿</div>
              <div className="text-xs text-stone-500 flex items-center gap-1">
                สต็อก:
                <button
                  onClick={() => quickStock(p, -1)}
                  className="px-2 bg-stone-200 rounded"
                >
                  −
                </button>
                <span className="font-bold text-stone-700">{p.stock}</span>
                <button
                  onClick={() => quickStock(p, 1)}
                  className="px-2 bg-stone-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => quickStock(p, 10)}
                  className="px-2 bg-orange-100 rounded text-orange-700"
                >
                  +10
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setEditing(p)}
                className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
              >
                แก้
              </button>
              <button
                onClick={() => del(p.id)}
                className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-4 border-b font-bold">
              {editing.id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-semibold">ชื่อ</label>
                <input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full border-2 border-stone-200 rounded-xl p-2 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold">ราคา (฿)</label>
                  <input
                    type="number"
                    value={editing.price ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                    className="w-full border-2 border-stone-200 rounded-xl p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">สต็อก</label>
                  <input
                    type="number"
                    value={editing.stock ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, stock: Number(e.target.value) })
                    }
                    className="w-full border-2 border-stone-200 rounded-xl p-2 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">URL รูปภาพ</label>
                <input
                  value={editing.imageUrl || ""}
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full border-2 border-stone-200 rounded-xl p-2 mt-1"
                />
                <div className="text-xs text-stone-400 mt-1">
                  อัปโหลดรูปฟรีที่ imgur.com / cloudinary.com แล้วก็อปลิงก์มาวาง
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border-2 border-stone-300 rounded-xl py-2 font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={save}
                className="flex-1 bg-orange-600 text-white rounded-xl py-2 font-bold"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
