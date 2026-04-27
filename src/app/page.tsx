import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <header className="text-center mb-12">
        <div className="inline-block px-4 py-1 rounded-full bg-white border border-amber-200 text-xs font-semibold tracking-widest text-orange-700 uppercase mb-4 shadow-soft">
          Welcome
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-stone-900 leading-none">
          บ้านขนมจีน
        </h1>
      </header>

      <p className="text-lg font-semibold text-stone-800 mb-3">
        เลือกรูปแบบการสั่งซื้อ
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          href="/preorder"
          className="btn-amber rounded-2xl py-7 text-center font-bold text-xl active:scale-[0.98] transition"
        >
          <div className="text-xs font-semibold tracking-widest opacity-70 uppercase mb-1">
            Schedule
          </div>
          สั่งล่วงหน้า
        </Link>
        <Link
          href="/buynow"
          className="btn-primary rounded-2xl py-7 text-center font-bold text-xl active:scale-[0.98] transition"
        >
          <div className="text-xs font-semibold tracking-widest opacity-80 uppercase mb-1">
            Order Now
          </div>
          ซื้อเลย!
        </Link>
      </div>

      <Link
        href="/admin/login"
        className="mt-14 text-xs text-stone-400 hover:text-stone-600 underline underline-offset-4"
      >
        สำหรับเจ้าของร้าน
      </Link>
    </main>
  );
}
