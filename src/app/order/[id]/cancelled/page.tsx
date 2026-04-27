import Link from "next/link";
import Icon from "@/components/Icon";

export default function CancelledPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white shadow-deep mb-6">
        <Icon name="close" size={42} strokeWidth={3} />
      </div>
      <div className="text-xs font-semibold tracking-widest text-red-700 uppercase">
        Cancelled
      </div>
      <h1 className="text-3xl font-black tracking-tight mt-1">ออเดอร์ถูกยกเลิก</h1>
      <p className="text-stone-500 mt-2">ขออภัยในความไม่สะดวก</p>
      <Link href="/" className="btn-primary mt-10 px-10 py-3.5 rounded-xl font-bold">
        กลับหน้าหลัก
      </Link>
    </main>
  );
}
