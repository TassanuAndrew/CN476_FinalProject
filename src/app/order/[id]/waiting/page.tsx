"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WaitingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch(`/api/orders/${id}/status`);
      if (!res.ok) return;
      const order = await res.json();
      if (order.status === "ACCEPTED") router.replace(`/order/${id}/payment`);
      else if (order.status === "CANCELLED" || order.status === "EXPIRED")
        router.replace(`/order/${id}/cancelled`);
    }, 2000);
    return () => clearInterval(poll);
  }, [id, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-orange-400 pulse-dot" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center shadow-deep">
          <svg
            className="w-10 h-10 text-white animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <div className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
        Order placed
      </div>
      <h1 className="text-2xl font-black tracking-tight mt-1">
        รอยืนยันออเดอร์{dots}
      </h1>
      <p className="text-stone-500 mt-2">กรุณารอเจ้าของร้านยืนยัน</p>
    </main>
  );
}
