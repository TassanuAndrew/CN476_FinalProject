"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface QrData {
  qr: string;
  amount: number;
  promptpay: string;
  shopName: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<QrData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}/qr`)
      .then(async (r) => {
        if (!r.ok) {
          setError((await r.json()).error || "เกิดข้อผิดพลาด");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setData(d));
  }, [id]);

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch(`/api/orders/${id}/status`);
      if (!res.ok) return;
      const order = await res.json();
      if (order.status === "PAID") router.replace(`/order/${id}/done`);
      else if (order.status === "CANCELLED" || order.status === "EXPIRED")
        router.replace(`/order/${id}/cancelled`);
    }, 2000);
    return () => clearInterval(poll);
  }, [id, router]);

  if (error)
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="card p-6 text-center max-w-sm">
          <div className="font-bold text-lg text-red-700">เกิดข้อผิดพลาด</div>
          <p className="text-stone-500 mt-1">{error}</p>
        </div>
      </main>
    );

  if (!data)
    return (
      <main className="min-h-screen flex items-center justify-center text-stone-500">
        กำลังสร้าง QR...
      </main>
    );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-3">
          <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
            Scan to Pay
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">{data.shopName}</h1>
        </div>

        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-white text-center py-3 font-bold tracking-widest text-sm uppercase">
            PromptPay
          </div>
          <div className="p-5">
            <div className="bg-white rounded-2xl p-3 border border-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.qr} alt="PromptPay QR" className="w-full" />
            </div>
            <div className="text-center text-stone-500 text-sm mt-3 font-mono">
              {data.promptpay}
            </div>
            <div className="mt-4 rounded-2xl bg-stone-900 text-white text-center py-4">
              <div className="text-xs uppercase tracking-widest opacity-60">
                ยอดที่ต้องชำระ
              </div>
              <div className="text-4xl font-black mt-0.5">
                ฿{data.amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-stone-500 mt-4">
          สแกนเพื่อชำระเงิน · รอเจ้าของร้านยืนยัน
        </p>
        <p className="text-center text-xs text-stone-400 mt-1">
          ออเดอร์จะหมดอายุภายใน 1 ชั่วโมง
        </p>
      </div>
    </main>
  );
}
