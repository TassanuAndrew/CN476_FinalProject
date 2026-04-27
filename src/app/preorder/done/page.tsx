import Link from "next/link";
import Icon from "@/components/Icon";

export default function PreOrderDone() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-deep mb-5">
        <Icon name="check" size={42} strokeWidth={3} />
      </div>
      <h1 className="text-3xl font-black tracking-tight">สั่งสินค้าเสร็จสิ้น</h1>
      <p className="text-stone-500 mt-2 max-w-xs">
        รอการติดต่อกลับจากร้านนะครับ
      </p>
      <Link
        href="/"
        className="btn-primary mt-10 px-10 py-3.5 rounded-xl font-bold"
      >
        กลับหน้าหลัก
      </Link>
    </main>
  );
}
