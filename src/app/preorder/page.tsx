"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen p-4 max-w-3xl mx-auto">
      <header className="flex items-center mb-4">
        <Link href="/" className="text-orange-600 text-2xl mr-2">
          ←
        </Link>
        <h1 className="text-2xl font-bold text-orange-700">📦 สั่งล่วงหน้า</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="bg-white rounded-2xl shadow p-3 text-left active:scale-95 transition"
          >
            <div className="aspect-square bg-orange-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🍜</span>
              )}
            </div>
            <div className="font-semibold text-stone-800 text-sm leading-tight">{p.name}</div>
            <div className="text-orange-600 font-bold mt-1">{p.price}฿</div>
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
    if (res.ok) {
      router.push("/preorder/done");
    } else {
      alert((await res.json()).error || "เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-2">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="p-4 border-b">
          <div className="font-bold text-lg">{product.name}</div>
          <div className="text-orange-600 font-bold">{product.price}฿ / ชิ้น</div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-semibold">รับสินค้า</label>
            <div className="flex gap-2 mt-1">
              {["PICKUP", "DELIVERY"].map((t) => (
                <label
                  key={t}
                  className={`flex-1 border-2 rounded-xl p-3 text-center cursor-pointer ${
                    form.deliveryType === t
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="dt"
                    className="hidden"
                    checked={form.deliveryType === t}
                    onChange={() => setForm({ ...form, deliveryType: t })}
                  />
                  {t === "PICKUP" ? "🏠 รับเอง" : "🛵 ส่งถึงที่"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">จำนวน (ชิ้น)</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })
              }
              className="w-full border-2 border-stone-200 rounded-xl p-3 mt-1"
            />
            <div className="text-right text-sm mt-1 text-stone-600">
              รวม <span className="font-bold text-orange-600">
                {(product.price * form.quantity).toLocaleString()}฿
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">วันที่นัดรับ/ส่ง</label>
            <input
              type="text"
              placeholder="เช่น 5 พ.ค. ตอนเย็น"
              value={form.pickupDateText}
              onChange={(e) => setForm({ ...form, pickupDateText: e.target.value })}
              className="w-full border-2 border-stone-200 rounded-xl p-3 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={3}
              placeholder="ที่อยู่จัดส่ง / รายละเอียดอื่นๆ"
              value={form.deliveryDetail}
              onChange={(e) => setForm({ ...form, deliveryDetail: e.target.value })}
              className="w-full border-2 border-stone-200 rounded-xl p-3 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">เบอร์ติดต่อ</label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full border-2 border-stone-200 rounded-xl p-3 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">ชื่อ</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full border-2 border-stone-200 rounded-xl p-3 mt-1"
            />
          </div>
        </div>

        <div className="p-4 border-t flex gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-stone-300 rounded-xl py-3 font-semibold"
          >
            ยกเลิก
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 bg-orange-600 text-white rounded-xl py-3 font-bold disabled:opacity-50"
          >
            {submitting ? "กำลังส่ง..." : "สั่งเลย!"}
          </button>
        </div>
      </div>
    </div>
  );
}
