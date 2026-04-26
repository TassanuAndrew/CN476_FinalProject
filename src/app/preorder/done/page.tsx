import Link from "next/link";

export default function PreOrderDone() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-orange-700 mb-2">
        สั่งสินค้าเสร็จสิ้น
      </h1>
      <p className="text-stone-600 mb-8">รอการติดต่อกลับจากร้านนะครับ</p>
      <Link
        href="/"
        className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold"
      >
        กลับหน้าหลัก
      </Link>
    </main>
  );
}
