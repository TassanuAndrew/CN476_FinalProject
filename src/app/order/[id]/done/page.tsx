"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderDone() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/buynow"), 3500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-7xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold text-orange-700">ขอบคุณครับบบ</h1>
      <p className="text-stone-600 mt-2">ชำระเงินเรียบร้อยแล้ว</p>
      <Link
        href="/buynow"
        className="mt-8 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold"
      >
        เลือกซื้ออีก
      </Link>
    </main>
  );
}
