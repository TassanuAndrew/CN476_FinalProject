"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  if (path === "/admin/login") return null;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const tabs = [
    { href: "/admin", label: "ออเดอร์", icon: "list" as const },
    { href: "/admin/products", label: "สินค้า", icon: "box" as const },
    { href: "/admin/stats", label: "สถิติ", icon: "spark" as const },
    { href: "/admin/settings", label: "ตั้งค่า", icon: "gear" as const },
  ];

  return (
    <nav className="bg-stone-900 text-white sticky top-0 z-40 shadow-deep">
      <div className="max-w-5xl mx-auto flex items-center px-3 py-2 gap-1 overflow-x-auto">
        <div className="font-black tracking-tight pr-2 hidden sm:block">
          <span className="text-amber-400">บ้าน</span>ขนมจีน
        </div>
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 text-sm transition ${
                active
                  ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-pop"
                  : "hover:bg-white/10 text-white/70"
              }`}
            >
              <Icon name={t.icon} size={18} />
              {t.label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="ml-auto px-3 py-2 rounded-lg hover:bg-white/10 text-white/70 font-semibold whitespace-nowrap flex items-center gap-1 text-sm"
        >
          <Icon name="logout" size={18} />
          ออก
        </button>
      </div>
    </nav>
  );
}
