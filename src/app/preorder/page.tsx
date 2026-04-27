"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export default function PreOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  return (
    <main className="min-h-screen p-5 max-w-3xl mx-auto pb-20">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-soft active:scale-95"
        >
          <Icon name="back" size={22} />
        </Link>
        <div>
          <div className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Pre-order
          </div>
          <h1 className="text-2xl font-bold tracking-tight">สั่งล่วงหน้า</h1>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="card p-3 text-left active:scale-[0.97] transition"
          >
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl mb-3 overflow-hidden border border-amber-100">
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2 min-h-[2.5em]">
              {p.name}
            </div>
            <div className="mt-1 text-orange-700 font-extrabold text-lg">
              ฿{p.price.toLocaleString()}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <PreOrderModal product={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

function PreOrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    deliveryType: "PICKUP",
    quantity: 1,
    deliveryDetail: "",
    pickupDateText: "",
    customerName: "",
    customerPhone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/orders/preorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, ...form }),
    });
    if (res.ok) router.push("/preorder/done");
    else {
      alert((await res.json()).error || "เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-2">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-auto shadow-deep">
        <div className="p-5 border-b border-stone-100 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Pre-order
            </div>
            <div className="font-bold text-lg leading-tight">{product.name}</div>
            <div className="text-orange-700 font-extrabold text-xl mt-1">
              ฿{product.price} <span className="text-xs font-medium text-stone-500">/ ชิ้น</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="label">รับสินค้า</div>
            <div className="flex gap-2 mt-2">
              {[
                { v: "PICKUP", emoji: "🏠", label: "รับเอง" },
                { v: "DELIVERY", emoji: "🛵", label: "ส่งถึงที่" },
              ].map((t) => (
                <label
                  key={t.v}
                  className={`flex-1 border-2 rounded-xl p-3 text-center cursor-pointer transition ${
                    form.deliveryType === t.v
                      ? "border-orange-500 bg-orange-50 shadow-soft"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="dt"
                    className="hidden"
                    checked={form.deliveryType === t.v}
                    onChange={() => setForm({ ...form, deliveryType: t.v })}
                  />
                  <div className="text-xl">{t.emoji}</div>
                  <div className="text-sm font-semibold mt-0.5">{t.label}</div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="label">จำนวน (ชิ้น)</div>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })
              }
              className="field mt-1.5 text-lg font-semibold"
            />
            <div className="text-right text-sm mt-1.5 text-stone-500">
              รวม{" "}
              <span className="font-extrabold text-orange-700 text-base">
                ฿{(product.price * form.quantity).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <div className="label">วันที่นัดรับ / ส่ง</div>
            <input
              type="text"
              placeholder="เช่น 5 พ.ค. ตอนเย็น"
              value={form.pickupDateText}
              onChange={(e) => setForm({ ...form, pickupDateText: e.target.value })}
              className="field mt-1.5"
            />
          </div>

          <div>
            <div className="label">รายละเอียดเพิ่มเติม</div>
            <textarea
              rows={3}
              placeholder="ที่อยู่จัดส่ง / รายละเอียดอื่นๆ"
              value={form.deliveryDetail}
              onChange={(e) => setForm({ ...form, deliveryDetail: e.target.value })}
              className="field mt-1.5 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="label">เบอร์ติดต่อ</div>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="field mt-1.5"
              />
            </div>
            <div>
              <div className="label">ชื่อ</div>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="field mt-1.5"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-100 flex gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="btn-ghost flex-1 rounded-xl py-3.5 font-semibold"
          >
            ยกเลิก
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary flex-1 rounded-xl py-3.5 font-bold disabled:opacity-50"
          >
            {submitting ? "กำลังส่ง..." : "สั่งเลย"}
          </button>
        </div>
      </div>
    </div>
  );
}
