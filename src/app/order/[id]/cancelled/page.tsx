import Link from "next/link";

export default function CancelledPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">😢</div>
      <h1 className="text-2xl font-bold text-red-600">ออเดอร์ถูกยกเลิก</h1>
      <p className="text-stone-600 mt-2">ขออภัยในความไม่สะดวก</p>
      <Link
        href="/"
        className="mt-8 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold"
      >
        กลับหน้าหลัก
      </Link>
    </main>
  );
}
