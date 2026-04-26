"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  if (path === "/admin/login") return null;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const tabs = [
    { href: "/admin", label: "📋 ออเดอร์" },
    { href: "/admin/products", label: "🍜 สินค้า" },
    { href: "/admin/settings", label: "⚙️ ตั้งค่า" },
  ];

  return (
    <nav className="bg-orange-600 text-white sticky top-0 z-40 shadow">
      <div className="max-w-5xl mx-auto flex items-center px-3 py-2 gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap ${
              path === t.href ? "bg-orange-800" : "hover:bg-orange-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="ml-auto px-3 py-2 rounded-lg hover:bg-orange-700 font-semibold whitespace-nowrap"
        >
          ออก
        </button>
      </div>
    </nav>
  );
}
