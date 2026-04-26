import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">🍜</div>
        <h1 className="text-4xl font-bold text-orange-700">บ้านขนมจีน</h1>
        <p className="text-stone-600 mt-2">เลือกรูปแบบการสั่งซื้อ</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          href="/preorder"
          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-2xl font-bold py-8 rounded-2xl shadow-lg text-center transition"
        >
          📦 สั่งล่วงหน้า
        </Link>
        <Link
          href="/buynow"
          className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-2xl font-bold py-8 rounded-2xl shadow-lg text-center transition"
        >
          🛒 ซื้อเลย!
        </Link>
      </div>

      <Link
        href="/admin/login"
        className="mt-12 text-sm text-stone-400 hover:text-stone-600"
      >
        เจ้าของร้าน
      </Link>
    </main>
  );
}
