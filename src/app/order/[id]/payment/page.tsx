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
        <div className="bg-white p-6 rounded-2xl text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <p>{error}</p>
        </div>
      </main>
    );

  if (!data)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>กำลังสร้าง QR...</div>
      </main>
    );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full text-center">
        <div className="text-orange-600 font-bold text-lg">{data.shopName}</div>
        <div className="text-sm text-stone-500 mb-3">PromptPay</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.qr} alt="PromptPay QR" className="w-full" />
        <div className="text-stone-600 text-sm mt-2">{data.promptpay}</div>
        <div className="text-3xl font-bold text-orange-600 mt-3">
          {data.amount.toLocaleString()} ฿
        </div>
        <p className="text-sm text-stone-500 mt-4">
          สแกนเพื่อชำระเงิน รอเจ้าของร้านยืนยัน
        </p>
        <p className="text-xs text-stone-400 mt-2">
          (ออเดอร์จะหมดอายุภายใน 1 ชั่วโมง)
        </p>
      </div>
    </main>
  );
}
