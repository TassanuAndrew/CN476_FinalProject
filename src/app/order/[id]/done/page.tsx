"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function OrderDone() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/buynow"), 3500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-deep mb-6">
        <Icon name="check" size={50} strokeWidth={3.5} />
      </div>
      <div className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
        Payment confirmed
      </div>
      <h1 className="text-4xl font-black tracking-tight mt-1">ขอบคุณครับบบ</h1>
      <p className="text-stone-500 mt-2">ชำระเงินเรียบร้อยแล้ว</p>
      <Link
        href="/buynow"
        className="btn-primary mt-10 px-10 py-3.5 rounded-xl font-bold"
      >
        เลือกซื้ออีก
      </Link>
    </main>
  );
}
