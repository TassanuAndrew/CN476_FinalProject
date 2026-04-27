"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

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
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("ลบไม่สำเร็จ");
      return;
    }
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
    <main className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
            Inventory
          </div>
          <h1 className="text-2xl font-black tracking-tight">จัดการสินค้า</h1>
        </div>
        <button
          onClick={() =>
            setEditing({ name: "", price: 0, stock: 0, imageUrl: "", active: true })
          }
          className="btn-primary px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5"
        >
          <Icon name="plus" size={16} strokeWidth={3} />
          เพิ่มสินค้า
        </button>
      </div>

      <div className="card divide-y divide-stone-100 overflow-hidden">
        {products.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-red-200 rounded-xl flex-shrink-0 overflow-hidden">
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-orange-700 font-extrabold">
                ฿{p.price.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  สต็อก
                </span>
                <button
                  onClick={() => quickStock(p, -1)}
                  className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center"
                >
                  <Icon name="minus" size={12} strokeWidth={3} />
                </button>
                <span className="font-extrabold text-stone-800 min-w-6 text-center">
                  {p.stock}
                </span>
                <button
                  onClick={() => quickStock(p, 1)}
                  className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center"
                >
                  <Icon name="plus" size={12} strokeWidth={3} />
                </button>
                <button
                  onClick={() => quickStock(p, 10)}
                  className="px-2 h-6 rounded bg-amber-100 text-amber-800 text-[11px] font-bold"
                >
                  +10
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setEditing(p)}
                className="btn-dark text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
              >
                <Icon name="edit" size={14} />
                แก้
              </button>
              <button
                onClick={() => del(p.id)}
                className="btn-ghost text-xs font-bold px-3 py-2 rounded-lg text-red-700"
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-deep">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="font-black text-lg">
                {editing.id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
              </div>
              <button
                onClick={() => setEditing(null)}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="label mb-1">ชื่อ</div>
                <input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="field"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="label mb-1">ราคา (฿)</div>
                  <input
                    type="number"
                    value={editing.price ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                    className="field"
                  />
                </div>
                <div>
                  <div className="label mb-1">สต็อก</div>
                  <input
                    type="number"
                    value={editing.stock ?? 0}
                    onChange={(e) =>
                      setEditing({ ...editing, stock: Number(e.target.value) })
                    }
                    className="field"
                  />
                </div>
              </div>
              <div>
                <div className="label mb-1">URL รูปภาพ</div>
                <input
                  value={editing.imageUrl || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="field"
                />
                <div className="text-xs text-stone-400 mt-1.5">
                  อัปโหลดรูปฟรีที่ imgur.com / cloudinary.com แล้วก็อปลิงก์มาวาง
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => setEditing(null)}
                className="btn-ghost flex-1 rounded-xl py-3 font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={save}
                className="btn-primary flex-1 rounded-xl py-3 font-bold"
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
