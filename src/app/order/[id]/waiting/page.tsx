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
      else if (order.status === "CANCELLED") router.replace(`/order/${id}/cancelled`);
      else if (order.status === "EXPIRED") router.replace(`/order/${id}/cancelled`);
    }, 2000);
    return () => clearInterval(poll);
  }, [id, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4 animate-bounce">⏳</div>
      <h1 className="text-2xl font-bold text-orange-700">รอยืนยันออเดอร์{dots}</h1>
      <p className="text-stone-600 mt-2">กรุณารอเจ้าของร้านยืนยัน</p>
    </main>
  );
}
